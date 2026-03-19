import { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://uqstflzxsivifkeqdptk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wzNezmXh8vHD9yBSbwnPUw_ImplTerw";

class SupabaseClient {
  constructor(url, key) { this.url = url; this.key = key; this.token = null; this.user = null; this._loadSession(); }
  _loadSession() { try { const s = localStorage.getItem("sb-session"); if (s) { const d = JSON.parse(s); this.token = d.access_token; this.user = d.user; } } catch {} }
  _saveSession(s) { this.token = s.access_token; this.user = s.user; localStorage.setItem("sb-session", JSON.stringify(s)); }
  _clearSession() { this.token = null; this.user = null; localStorage.removeItem("sb-session"); }
  async _fetch(ep, opts = {}) {
    const h = { "Content-Type": "application/json", apikey: this.key, ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}), ...opts.headers };
    const res = await fetch(`${this.url}${ep}`, { ...opts, headers: h });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error_description || e.msg || e.message || `Error ${res.status}`); }
    const t = await res.text(); return t ? JSON.parse(t) : {};
  }
  async signUp(email, password) { const d = await this._fetch("/auth/v1/signup", { method: "POST", body: JSON.stringify({ email, password }) }); if (d.access_token) this._saveSession(d); return d; }
  async signIn(email, password) { const d = await this._fetch("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) }); if (d.access_token) this._saveSession(d); return d; }
  async signOut() { try { await this._fetch("/auth/v1/logout", { method: "POST" }); } catch {} this._clearSession(); }
  getUser() { return this.user; }
  isAuthenticated() { return !!this.token; }
  from(table) {
    const self = this; let query = "", method = "GET", body = null, extra = {};
    const b = {
      select(c="*"){query+=`?select=${c}`;return b},eq(col,val){query+=`&${col}=eq.${val}`;return b},
      order(col,{ascending=true}={}){query+=`&order=${col}.${ascending?"asc":"desc"}`;return b},
      limit(n){query+=`&limit=${n}`;return b},single(){extra["Accept"]="application/vnd.pgrst.object+json";return b},
      insert(data){method="POST";body=JSON.stringify(data);extra["Prefer"]="return=representation";return b},
      update(data){method="PATCH";body=JSON.stringify(data);extra["Prefer"]="return=representation";return b},
      async execute(){return self._fetch(`/rest/v1/${table}${query}`,{method,body,headers:extra})}
    }; return b;
  }
}
const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

const C = { bg:"#080E1A",bgSurface:"#0C1425",bgCard:"#111C35",bgInput:"#162040",green:"#2D8B4E",greenBright:"#38B261",white:"#F2F4F8",gray1:"#D8DDE6",gray2:"#A0AAB8",gray3:"#6B7688",gray4:"#404C60",border:"#1A2848",borderFocus:"#2D8B4E",danger:"#D94452",shadow:"0 8px 32px rgba(0,0,0,0.4)" };
const FONT = `'DM Sans',system-ui,sans-serif`;
const FONT_DISPLAY = `'Playfair Display',Georgia,serif`;

const getKey = () => localStorage.getItem("nitzsche_openai_key") || "";
const setKey = (k) => localStorage.setItem("nitzsche_openai_key", k);
const getModel = () => localStorage.getItem("nitzsche_model") || "gpt-4o-mini";
const setModel = (m) => localStorage.setItem("nitzsche_model", m);

const MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", desc: "Rápido e barato — $0.15/$0.60 por 1M tokens", inputPrice: 0.15, outputPrice: 0.6 },
  { id: "gpt-4o", name: "GPT-4o", desc: "Equilibrado — $2.50/$10 por 1M tokens", inputPrice: 2.5, outputPrice: 10 },
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", desc: "Rápido, boa qualidade — $0.40/$1.60 por 1M tokens", inputPrice: 0.4, outputPrice: 1.6 },
  { id: "gpt-4.1", name: "GPT-4.1", desc: "Avançado — $2/$8 por 1M tokens", inputPrice: 2, outputPrice: 8 },
  { id: "gpt-4.5-preview", name: "GPT-4.5 Preview", desc: "Mais inteligente — $75/$150 por 1M tokens", inputPrice: 75, outputPrice: 150 },
];

const callAI = async (messages, systemPrompt) => {
  const apiKey = getKey();
  if (!apiKey) throw new Error("API Key da OpenAI não configurada. Clique em ⚙️ Configurações.");
  const model = getModel();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages: [{ role: "system", content: systemPrompt }, ...messages], temperature: 0.7, max_tokens: 1500 }),
  });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message || `OpenAI Error: ${res.status}`); }
  const data = await res.json();
  return { text: data.choices[0].message.content, inputTokens: data.usage?.prompt_tokens||0, outputTokens: data.usage?.completion_tokens||0, cacheReadTokens: data.usage?.prompt_tokens_details?.cached_tokens||0 };
};

const DEFAULT_PROMPT = `Você é um coach especialista em comunicação e feedback corporativo da Nitzsche Consultoria. Seu papel é treinar o usuário a dar e receber feedback de forma eficaz, empática e assertiva.

PERFIL DO USUÁRIO (quem vai dar o feedback):
- Nome: {{user_name}}
- Idade: {{user_age}} anos
- Cargo: {{user_role}}
- Perfil de personalidade: {{user_personality}}

PERFIL DO RECEPTOR (quem vai receber o feedback):
- Idade: {{target_age}} anos
- Cargo: {{target_role}}
- Perfil de personalidade: {{target_personality}}

CONTEXTO DA SITUAÇÃO:
{{situation_context}}

INSTRUÇÕES:
1. Considere os aspectos geracionais de ambas as partes para adaptar a linguagem e abordagem.
2. Considere os perfis de personalidade para sugerir a melhor forma de comunicação.
3. Use técnicas como: SBI (Situação-Comportamento-Impacto), comunicação não-violenta, escuta ativa.
4. Guie o usuário passo a passo na construção do feedback.
5. Faça simulações de diálogo quando apropriado.
6. Dê dicas sobre linguagem corporal, tom de voz e timing.
7. O ambiente é de uma concessionária de veículos — use referências relevantes.
8. Seja encorajador mas honesto sobre áreas de melhoria.
9. Responda sempre em português brasileiro.
10. Seja conciso e prático.`;

const buildPrompt = (tpl, u, t, ctx) => tpl.replace("{{user_name}}",u.name||"").replace("{{user_age}}",u.age||"").replace("{{user_role}}",u.role||"").replace("{{user_personality}}",u.personality||"").replace("{{target_age}}",t.age||"").replace("{{target_role}}",t.role||"").replace("{{target_personality}}",t.personality||"").replace("{{situation_context}}",ctx||"");

const ACTION_PLAN_PROMPT = `Com base na conversa de treinamento de feedback acima, gere um plano de ação estruturado em JSON com o seguinte formato exato (sem markdown, sem backticks, apenas JSON puro):
{"titulo":"Título do plano","resumo":"Resumo de 2-3 frases","itens":[{"acao":"Descrição da ação","prazo":"Prazo sugerido","como":"Como executar","indicador":"Como saber se deu certo"}],"dicas_finais":"Dicas gerais"}
Gere entre 3 e 6 itens. Responda APENAS com o JSON.`;

const Icon = {
  Send:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Plus:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Chat:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  Logout:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Mail:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7"/></svg>,
  Lock:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  Settings:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  Edit:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Check:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Clipboard:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  Arrow:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Tokens:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>,
};
const Logo=({size=36})=><svg width={size} height={size} viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill={C.bg} stroke={C.border} strokeWidth="2"/><path d="M25 75V25h10l25 35V25h10v50H60L35 40v35z" fill={C.white}/><path d="M50 45l15 20V45h10v30H65L50 55z" fill={C.green} opacity="0.9"/></svg>;
const Typing=()=>{const[f,setF]=useState(0);useEffect(()=>{const t=setInterval(()=>setF(v=>(v+1)%3),400);return()=>clearInterval(t)},[]);return<div style={{display:"flex",gap:5,padding:"6px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.gray3,opacity:i===f?1:0.3,transform:`scale(${i===f?1.2:1})`,transition:"all 0.25s"}}/>)}</div>};

const cssBase=`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');*{margin:0;padding:0;box-sizing:border-box}body{margin:0;background:${C.bg};font-family:${FONT};color:${C.white}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}::selection{background:${C.green};color:white}input:focus,textarea:focus{border-color:${C.borderFocus} !important;outline:none}button{font-family:${FONT}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fade-in{animation:fadeIn 0.3s ease}`;

const Input=({label,...props})=><div style={{marginBottom:18}}>{label&&<label style={{display:"block",fontSize:13,fontWeight:500,color:C.gray2,marginBottom:6}}>{label}</label>}<input {...props} style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:C.bgInput,color:C.white,fontSize:15,fontFamily:FONT,outline:"none",transition:"border-color 0.2s",boxSizing:"border-box",...props.style}}/></div>;
const TextArea=({label,...props})=><div style={{marginBottom:18}}>{label&&<label style={{display:"block",fontSize:13,fontWeight:500,color:C.gray2,marginBottom:6}}>{label}</label>}<textarea {...props} style={{width:"100%",padding:"11px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:C.bgInput,color:C.white,fontSize:15,fontFamily:FONT,outline:"none",resize:"vertical",minHeight:100,lineHeight:1.5,boxSizing:"border-box",...props.style}}/></div>;
const Btn=({children,variant="primary",small,disabled,...props})=>{const p=variant==="primary";return<button disabled={disabled} {...props} style={{padding:small?"8px 16px":"12px 22px",borderRadius:10,border:p?"none":`1px solid ${C.border}`,background:p?`linear-gradient(135deg,${C.green},${C.greenBright})`:"transparent",color:p?C.white:C.gray2,fontSize:small?13:15,fontWeight:600,fontFamily:FONT,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.4:1,transition:"all 0.2s",boxShadow:p?"0 4px 16px rgba(45,139,78,0.25)":"none",display:"flex",alignItems:"center",justifyContent:"center",gap:8,...props.style}}>{children}</button>};


export default function NitzscheApp() {
  const [authState, setAuthState] = useState(supabase.isAuthenticated()?"authenticated":"login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [profile, setProfile] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onboardStep, setOnboardStep] = useState(0);
  const [userProfile, setUserProfile] = useState({name:"",age:"",role:"",personality:""});
  const [targetProfile, setTargetProfile] = useState({age:"",role:"",personality:"",knowsProfile:null});
  const [situationContext, setSituationContext] = useState("");
  const [discoveryMsgs, setDiscoveryMsgs] = useState([]);
  const [discoveryInput, setDiscoveryInput] = useState("");
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryDone, setDiscoveryDone] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionTokens, setSessionTokens] = useState({input:0,output:0,cached:0,cost:0});
  const [showSettings, setShowSettings] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [showActionPlan, setShowActionPlan] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getKey());
  const [selectedModel, setSelectedModel] = useState(getModel());
  const [promptText, setPromptText] = useState(DEFAULT_PROMPT);
  const [promptSaved, setPromptSaved] = useState(false);
  const [actionPlan, setActionPlan] = useState(null);
  const [actionPlanLoading, setActionPlanLoading] = useState(false);
  const [actionChecks, setActionChecks] = useState({});
  const chatEndRef = useRef(null);
  const discoveryEndRef = useRef(null);

  useEffect(()=>{chatEndRef.current?.scrollIntoView({behavior:"smooth"})},[messages,isLoading]);
  useEffect(()=>{discoveryEndRef.current?.scrollIntoView({behavior:"smooth"})},[discoveryMsgs]);
  useEffect(()=>{if(authState==="authenticated")loadProfile()},[authState]);
  useEffect(()=>{if(profile)loadConversations()},[profile]);
  useEffect(()=>{if(activeConvId)loadMessages(activeConvId);else setMessages([])},[activeConvId]);
  useEffect(()=>{const s=localStorage.getItem("nitzsche_prompt");if(s)setPromptText(s)},[]);

  const handleAuth=async()=>{
    if(!authEmail.trim()||!authPassword.trim()){setAuthError("Preencha todos os campos");return}
    if(authMode==="signup"&&authPassword.length<6){setAuthError("Senha: mínimo 6 caracteres");return}
    setAuthLoading(true);setAuthError("");
    try{if(authMode==="signup")await supabase.signUp(authEmail.trim(),authPassword.trim());else await supabase.signIn(authEmail.trim(),authPassword.trim());setAuthState("authenticated")}
    catch(err){if(err.message.includes("Invalid")||err.message.includes("invalid"))setAuthError("E-mail ou senha incorretos");else if(err.message.includes("already registered")){setAuthError("E-mail já cadastrado.");setAuthMode("login")}else setAuthError(err.message)}
    setAuthLoading(false)};
  const signOut=async()=>{await supabase.signOut();setAuthState("login");setProfile(null);setConversations([]);setActiveConvId(null);setMessages([])};

  const loadProfile=async()=>{try{const u=supabase.getUser();if(!u)return;const d=await supabase.from("profiles").select().eq("id",u.id).single().execute();setProfile(d)}catch{const u=supabase.getUser();setProfile({id:u?.id,email:u?.email,full_name:u?.email?.split("@")[0],is_admin:false})}};
  const loadConversations=async()=>{try{const d=await supabase.from("conversations").select().eq("user_id",profile.id).order("last_message_at",{ascending:false}).execute();setConversations(d||[])}catch{}};
  const loadMessages=async(id)=>{try{const d=await supabase.from("messages").select().eq("conversation_id",id).order("created_at",{ascending:true}).execute();setMessages(d||[])}catch{}};
  const saveConversation=async(d)=>{try{const r=await supabase.from("conversations").insert(d).execute();return r[0]}catch(e){console.error(e);return null}};
  const saveMessage=async(d)=>{try{await supabase.from("messages").insert(d).execute()}catch(e){console.error(e)}};

  const startNew=()=>{setOnboardStep(1);setUserProfile({name:profile?.full_name||"",age:profile?.age||"",role:profile?.role||"",personality:profile?.personality||""});setTargetProfile({age:"",role:"",personality:"",knowsProfile:null});setSituationContext("");setActiveConvId(null);setMessages([]);setDiscoveryMsgs([]);setDiscoveryDone(false);setSessionTokens({input:0,output:0,cached:0,cost:0});setActionPlan(null);setActionChecks({})};
  const resumeConv=(conv)=>{setActiveConvId(conv.id);setOnboardStep(0);setActionPlan(null);setActionChecks({})};

  const totalSteps=5;
  const canAdvance=()=>{switch(onboardStep){case 1:return userProfile.name&&userProfile.age&&userProfile.role&&userProfile.personality;case 2:return targetProfile.knowsProfile!==null;case 3:return targetProfile.knowsProfile?(targetProfile.age&&targetProfile.role&&targetProfile.personality):(discoveryDone&&targetProfile.personality);case 4:return situationContext.trim().length>20;case 5:return true;default:return false}};

  const handleAdvance=async()=>{
    if(onboardStep===5){
      const conv=await saveConversation({user_id:profile.id,title:`Feedback → ${targetProfile.role||"Colaborador"}`,user_profile:userProfile,target_profile:targetProfile,situation_context:situationContext});
      if(conv){setConversations(p=>[conv,...p]);setActiveConvId(conv.id);setOnboardStep(0);
        try{await supabase.from("profiles").eq("id",profile.id).update({full_name:userProfile.name,age:parseInt(userProfile.age),role:userProfile.role,personality:userProfile.personality}).execute()}catch{}
        sendInitial(conv)}
    }else setOnboardStep(s=>s+1)};

  const getSysPrompt=(conv)=>buildPrompt(promptText,conv.user_profile,conv.target_profile,conv.situation_context);
  const updateTokens=(r)=>{const m=MODELS.find(x=>x.id===getModel())||MODELS[0];setSessionTokens(p=>({input:p.input+r.inputTokens,output:p.output+r.outputTokens,cached:p.cached+r.cacheReadTokens,cost:p.cost+(r.inputTokens*m.inputPrice+r.outputTokens*m.outputPrice)/1000000}))};

  const sendInitial=async(conv)=>{setIsLoading(true);try{const r=await callAI([{role:"user",content:"Olá! Estou pronto para iniciar o treinamento de feedback. Me oriente sobre a melhor abordagem considerando os perfis e contexto informados."}],getSysPrompt(conv));const m={conversation_id:conv.id,role:"assistant",content:r.text,input_tokens:r.inputTokens,output_tokens:r.outputTokens,cache_read_tokens:r.cacheReadTokens};await saveMessage(m);setMessages([{...m,created_at:new Date().toISOString()}]);updateTokens(r)}catch(e){setMessages([{role:"assistant",content:`Erro: ${e.message}`,created_at:new Date().toISOString()}])}setIsLoading(false)};

  const sendMessage=async()=>{if(!chatInput.trim()||isLoading||!activeConvId)return;const text=chatInput.trim();setChatInput("");const um={conversation_id:activeConvId,role:"user",content:text,input_tokens:0,output_tokens:0};await saveMessage(um);const nm=[...messages,{...um,created_at:new Date().toISOString()}];setMessages(nm);setIsLoading(true);try{const conv=conversations.find(c=>c.id===activeConvId);const r=await callAI(nm.map(m=>({role:m.role,content:m.content})),getSysPrompt(conv));const am={conversation_id:activeConvId,role:"assistant",content:r.text,input_tokens:r.inputTokens,output_tokens:r.outputTokens,cache_read_tokens:r.cacheReadTokens};await saveMessage(am);setMessages(p=>[...p,{...am,created_at:new Date().toISOString()}]);updateTokens(r)}catch(e){setMessages(p=>[...p,{role:"assistant",content:`Erro: ${e.message}`,created_at:new Date().toISOString()}])}setIsLoading(false)};

  const generateActionPlan=async()=>{if(!activeConvId||messages.length<2)return;setActionPlanLoading(true);try{const conv=conversations.find(c=>c.id===activeConvId);const hist=messages.map(m=>({role:m.role,content:m.content}));hist.push({role:"user",content:ACTION_PLAN_PROMPT});const r=await callAI(hist,getSysPrompt(conv));const parsed=JSON.parse(r.text.replace(/```json?|```/g,"").trim());setActionPlan(parsed);setActionChecks({});setShowActionPlan(true);updateTokens(r)}catch(e){alert("Erro ao gerar plano: "+e.message)}setActionPlanLoading(false)};
  const toggleCheck=(i)=>setActionChecks(p=>({...p,[i]:!p[i]}));

  const startDiscovery=async()=>{setDiscoveryLoading(true);try{const r=await callAI([{role:"user",content:"Preciso de ajuda para identificar o perfil da pessoa para quem vou dar feedback."}],`Você ajuda a identificar perfis de personalidade no trabalho. Faça até 5 perguntas, uma por vez. Ao final, escreva "PERFIL IDENTIFICADO:" seguido do resumo. Em português.`);setDiscoveryMsgs([{role:"assistant",content:r.text}])}catch(e){setDiscoveryMsgs([{role:"assistant",content:`Erro: ${e.message}`}])}setDiscoveryLoading(false)};
  const sendDiscovery=async()=>{if(!discoveryInput.trim()||discoveryLoading)return;const up=[...discoveryMsgs,{role:"user",content:discoveryInput.trim()}];setDiscoveryMsgs(up);setDiscoveryInput("");setDiscoveryLoading(true);try{const r=await callAI(up,`Você ajuda a identificar perfis de personalidade no trabalho. Faça até 5 perguntas, uma por vez. Ao final, escreva "PERFIL IDENTIFICADO:" seguido do resumo. Em português.`);setDiscoveryMsgs([...up,{role:"assistant",content:r.text}]);if(r.text.includes("PERFIL IDENTIFICADO:")){setTargetProfile(p=>({...p,personality:r.text.split("PERFIL IDENTIFICADO:")[1].trim()}));setDiscoveryDone(true)}}catch(e){setDiscoveryMsgs([...up,{role:"assistant",content:`Erro: ${e.message}`}])}setDiscoveryLoading(false)};

  const savePrompt=()=>{localStorage.setItem("nitzsche_prompt",promptText);setPromptSaved(true);setTimeout(()=>setPromptSaved(false),2000)};
  const resetPrompt=()=>{setPromptText(DEFAULT_PROMPT);localStorage.removeItem("nitzsche_prompt")};

  // LOGIN
  if(authState!=="authenticated")return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(ellipse at 20% 20%,${C.bgSurface} 0%,${C.bg} 70%)`,padding:20}}>
      <style>{cssBase}</style>
      <div style={{background:C.bgCard,borderRadius:20,padding:"44px 36px",width:"100%",maxWidth:400,border:`1px solid ${C.border}`,boxShadow:C.shadow}} className="fade-in">
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}><Logo size={40}/><div><div style={{fontFamily:FONT_DISPLAY,fontSize:24,fontWeight:700}}>Nitzsche</div><div style={{fontSize:11,color:C.green,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase"}}>Feedback Training</div></div></div>
        <p style={{color:C.gray2,fontSize:14,marginBottom:28,lineHeight:1.6}}>{authMode==="login"?"Entre com seu e-mail e senha.":"Crie sua conta para começar."}</p>
        <Input label="E-mail" type="email" placeholder="seu@empresa.com" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAuth()}/>
        <Input label="Senha" type="password" placeholder={authMode==="signup"?"Mínimo 6 caracteres":"••••••••"} value={authPassword} onChange={e=>setAuthPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAuth()}/>
        {authError&&<p style={{color:C.danger,fontSize:13,marginBottom:12}}>{authError}</p>}
        <Btn onClick={handleAuth} disabled={authLoading} style={{width:"100%",marginBottom:16}}>{authLoading?"Aguarde...":authMode==="login"?<><Icon.Lock/> Entrar</>:<><Icon.Mail/> Criar conta</>}</Btn>
        <button onClick={()=>{setAuthMode(authMode==="login"?"signup":"login");setAuthError("")}} style={{background:"none",border:"none",color:C.gray3,fontSize:13,cursor:"pointer",width:"100%",textAlign:"center",lineHeight:1.6}}>{authMode==="login"?<>Não tem conta? <span style={{color:C.green,fontWeight:600}}>Cadastre-se</span></>:<>Já tem conta? <span style={{color:C.green,fontWeight:600}}>Faça login</span></>}</button>
      </div>
    </div>);

  // MODALS
  const settingsModal=showSettings&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={()=>setShowSettings(false)}><div style={{background:C.bgCard,borderRadius:20,padding:32,width:"100%",maxWidth:520,maxHeight:"85vh",overflow:"auto",border:`1px solid ${C.border}`,boxShadow:C.shadow}} onClick={e=>e.stopPropagation()}><h3 style={{fontFamily:FONT_DISPLAY,fontSize:20,marginBottom:20}}>Configurações</h3><Input label="API Key da OpenAI" type="password" placeholder="sk-..." value={apiKeyInput} onChange={e=>setApiKeyInput(e.target.value)}/><p style={{fontSize:12,color:C.gray4,marginBottom:16,marginTop:-10}}>Salva apenas no seu navegador.</p><div style={{marginBottom:18}}><label style={{display:"block",fontSize:13,fontWeight:500,color:C.gray2,marginBottom:8}}>Modelo</label>{MODELS.map(m=><div key={m.id} onClick={()=>setSelectedModel(m.id)} style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${selectedModel===m.id?C.green:C.border}`,background:selectedModel===m.id?C.bgInput:"transparent",marginBottom:6,cursor:"pointer",transition:"all 0.2s"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:14,fontWeight:600,color:selectedModel===m.id?C.white:C.gray2}}>{m.name}</span>{selectedModel===m.id&&<Icon.Check/>}</div><div style={{fontSize:12,color:C.gray3,marginTop:2}}>{m.desc}</div></div>)}</div><div style={{display:"flex",gap:10}}><Btn onClick={()=>{setKey(apiKeyInput);setModel(selectedModel);setShowSettings(false)}} style={{flex:1}}>Salvar</Btn><Btn variant="ghost" onClick={()=>setShowSettings(false)} style={{border:`1px solid ${C.border}`}}>Cancelar</Btn></div></div></div>;

  const promptModal=showPromptEditor&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={()=>setShowPromptEditor(false)}><div style={{background:C.bgCard,borderRadius:20,padding:32,width:"100%",maxWidth:700,maxHeight:"85vh",overflow:"auto",border:`1px solid ${C.border}`,boxShadow:C.shadow}} onClick={e=>e.stopPropagation()}><h3 style={{fontFamily:FONT_DISPLAY,fontSize:20,marginBottom:8}}>Editor de Prompt</h3><p style={{fontSize:13,color:C.gray3,marginBottom:16}}>Variáveis: {"{{user_name}}, {{user_age}}, {{user_role}}, {{user_personality}}, {{target_age}}, {{target_role}}, {{target_personality}}, {{situation_context}}"}</p><textarea value={promptText} onChange={e=>setPromptText(e.target.value)} style={{width:"100%",minHeight:350,padding:14,borderRadius:10,border:`1px solid ${C.border}`,background:C.bgInput,color:C.white,fontSize:14,fontFamily:"monospace",lineHeight:1.6,resize:"vertical",outline:"none",boxSizing:"border-box"}}/><div style={{display:"flex",gap:10,marginTop:16}}><Btn onClick={savePrompt} style={{flex:1}}>{promptSaved?<><Icon.Check/> Salvo!</>:"Salvar"}</Btn><Btn variant="ghost" onClick={resetPrompt} style={{border:`1px solid ${C.border}`}}>Restaurar padrão</Btn><Btn variant="ghost" onClick={()=>setShowPromptEditor(false)} style={{border:`1px solid ${C.border}`}}>Fechar</Btn></div></div></div>;

  const planModal=showActionPlan&&actionPlan&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={()=>setShowActionPlan(false)}><div style={{background:C.bgCard,borderRadius:20,padding:32,width:"100%",maxWidth:640,maxHeight:"85vh",overflow:"auto",border:`1px solid ${C.border}`,boxShadow:C.shadow}} onClick={e=>e.stopPropagation()}><h3 style={{fontFamily:FONT_DISPLAY,fontSize:20,marginBottom:4}}>{actionPlan.titulo}</h3><p style={{fontSize:14,color:C.gray2,marginBottom:20,lineHeight:1.6}}>{actionPlan.resumo}</p>{actionPlan.itens?.map((item,i)=><div key={i} style={{background:C.bgInput,borderRadius:12,padding:"14px 16px",marginBottom:10,border:`1px solid ${actionChecks[i]?C.green:C.border}`,transition:"all 0.2s"}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><button onClick={()=>toggleCheck(i)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${actionChecks[i]?C.green:C.gray4}`,background:actionChecks[i]?C.green:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:2,transition:"all 0.2s"}}>{actionChecks[i]&&<Icon.Check/>}</button><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:actionChecks[i]?C.gray3:C.white,textDecoration:actionChecks[i]?"line-through":"none",marginBottom:4}}>{item.acao}</div><div style={{fontSize:13,color:C.gray3}}><strong style={{color:C.gray2}}>Prazo:</strong> {item.prazo}</div><div style={{fontSize:13,color:C.gray3}}><strong style={{color:C.gray2}}>Como:</strong> {item.como}</div><div style={{fontSize:13,color:C.gray3}}><strong style={{color:C.gray2}}>Indicador:</strong> {item.indicador}</div></div></div></div>)}{actionPlan.dicas_finais&&<div style={{background:C.bgInput,borderRadius:12,padding:"14px 16px",marginTop:12,borderLeft:`3px solid ${C.green}`}}><div style={{fontSize:12,fontWeight:600,color:C.green,textTransform:"uppercase",marginBottom:6}}>Dicas finais</div><div style={{fontSize:14,color:C.gray1,lineHeight:1.6}}>{actionPlan.dicas_finais}</div></div>}<Btn onClick={()=>setShowActionPlan(false)} style={{width:"100%",marginTop:20}}>Fechar</Btn></div></div>;

  // ONBOARDING
  const renderOnboarding=()=>{const titles=["","Seu Perfil","Receptor do Feedback","Perfil do Receptor","Contexto da Situação","Confirmar Dados"];return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24,overflowY:"auto"}}><div style={{background:C.bgCard,borderRadius:20,padding:"36px 32px",width:"100%",maxWidth:540,border:`1px solid ${C.border}`,boxShadow:C.shadow}} className="fade-in">
      <div style={{display:"flex",gap:6,marginBottom:24}}>{[1,2,3,4,5].map(s=><div key={s} style={{height:4,flex:1,borderRadius:4,background:s<=onboardStep?C.green:C.border,transition:"all 0.3s"}}/>)}</div>
      <h2 style={{fontFamily:FONT_DISPLAY,fontSize:22,marginBottom:4}}>{titles[onboardStep]}</h2>
      <p style={{fontSize:13,color:C.gray3,marginBottom:22}}>Etapa {onboardStep} de {totalSteps}</p>
      {onboardStep===1&&<div><Input label="Nome" placeholder="Seu nome completo" value={userProfile.name} onChange={e=>setUserProfile(p=>({...p,name:e.target.value}))}/><Input label="Idade" type="number" placeholder="Ex: 35" value={userProfile.age} onChange={e=>setUserProfile(p=>({...p,age:e.target.value}))}/><Input label="Cargo" placeholder="Ex: Gerente de Vendas" value={userProfile.role} onChange={e=>setUserProfile(p=>({...p,role:e.target.value}))}/><TextArea label="Perfil de personalidade" placeholder="DISC, MBTI, ou descreva..." value={userProfile.personality} onChange={e=>setUserProfile(p=>({...p,personality:e.target.value}))}/></div>}
      {onboardStep===2&&<div><p style={{color:C.gray1,fontSize:15,marginBottom:20,lineHeight:1.6}}>Você conhece o perfil de personalidade do receptor?</p><div style={{display:"flex",gap:12}}><Btn style={{flex:1}} variant={targetProfile.knowsProfile===true?"primary":"ghost"} onClick={()=>setTargetProfile(p=>({...p,knowsProfile:true}))}>Sim, conheço</Btn><Btn style={{flex:1}} variant={targetProfile.knowsProfile===false?"primary":"ghost"} onClick={()=>{setTargetProfile(p=>({...p,knowsProfile:false}));if(!discoveryMsgs.length)startDiscovery()}}>Não, preciso de ajuda</Btn></div></div>}
      {onboardStep===3&&targetProfile.knowsProfile&&<div><Input label="Idade do receptor" type="number" placeholder="Ex: 28" value={targetProfile.age} onChange={e=>setTargetProfile(p=>({...p,age:e.target.value}))}/><Input label="Cargo" placeholder="Ex: Consultor de Vendas" value={targetProfile.role} onChange={e=>setTargetProfile(p=>({...p,role:e.target.value}))}/><TextArea label="Perfil de personalidade" placeholder="Descreva..." value={targetProfile.personality} onChange={e=>setTargetProfile(p=>({...p,personality:e.target.value}))}/></div>}
      {onboardStep===3&&targetProfile.knowsProfile===false&&<div><div style={{background:C.bgInput,borderRadius:12,border:`1px solid ${C.border}`,maxHeight:280,overflowY:"auto",marginBottom:14,padding:14}}>{discoveryMsgs.map((m,i)=><div key={i} style={{marginBottom:10}}><div style={{fontSize:11,fontWeight:600,color:m.role==="assistant"?C.green:C.gray3,textTransform:"uppercase",marginBottom:3}}>{m.role==="assistant"?"Assistente":"Você"}</div><div style={{fontSize:14,color:C.gray1,lineHeight:1.6}}>{m.content}</div></div>)}{discoveryLoading&&<Typing/>}<div ref={discoveryEndRef}/></div>{!discoveryDone?<div style={{display:"flex",gap:8}}><input value={discoveryInput} onChange={e=>setDiscoveryInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendDiscovery()} placeholder="Sua resposta..." style={{flex:1,padding:"10px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:C.bgInput,color:C.white,fontSize:14,fontFamily:FONT,outline:"none"}}/><Btn small onClick={sendDiscovery} disabled={discoveryLoading}>Enviar</Btn></div>:<><div style={{background:C.bgInput,borderRadius:10,padding:"12px 16px",marginBottom:14,border:`1px solid ${C.green}`}}><div style={{fontSize:11,fontWeight:600,color:C.green,textTransform:"uppercase",marginBottom:6}}>Perfil Identificado</div><div style={{fontSize:14,color:C.gray1,lineHeight:1.5}}>{targetProfile.personality}</div></div><Input label="Idade do receptor" type="number" placeholder="Ex: 28" value={targetProfile.age} onChange={e=>setTargetProfile(p=>({...p,age:e.target.value}))}/><Input label="Cargo" placeholder="Ex: Consultor" value={targetProfile.role} onChange={e=>setTargetProfile(p=>({...p,role:e.target.value}))}/></>}</div>}
      {onboardStep===4&&<div><p style={{color:C.gray1,fontSize:14,marginBottom:14,lineHeight:1.6}}>Descreva a situação: o que aconteceu, quando, o impacto e resultado esperado.</p><TextArea placeholder="Ex: Na última semana..." value={situationContext} onChange={e=>setSituationContext(e.target.value)} style={{minHeight:140}}/><p style={{fontSize:12,color:C.gray4}}>Mínimo 20 caracteres</p></div>}
      {onboardStep===5&&<div>{[{l:"Seu Perfil",t:`${userProfile.name}, ${userProfile.age} anos — ${userProfile.role}\n${userProfile.personality}`},{l:"Receptor",t:`${targetProfile.age} anos — ${targetProfile.role}\n${targetProfile.personality}`},{l:"Contexto",t:situationContext}].map((s,i)=><div key={i} style={{background:C.bgInput,borderRadius:10,padding:"14px 16px",marginBottom:12,border:`1px solid ${C.border}`}}><div style={{fontSize:11,fontWeight:600,color:C.green,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>{s.l}</div><div style={{fontSize:14,color:C.gray1,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{s.t}</div></div>)}</div>}
      <div style={{display:"flex",gap:10,marginTop:24}}>{onboardStep>1&&<Btn variant="ghost" onClick={()=>setOnboardStep(s=>s-1)} style={{border:`1px solid ${C.border}`}}>Voltar</Btn>}<Btn onClick={canAdvance()?handleAdvance:undefined} disabled={!canAdvance()} style={{flex:1}}>{onboardStep===5?"Iniciar Treinamento":"Continuar"} <Icon.Arrow/></Btn></div>
    </div></div>)};

  // CHAT
  const renderChat=()=>{if(!activeConvId)return<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:40}}><div style={{textAlign:"center",maxWidth:380}} className="fade-in"><Logo size={56}/><h2 style={{fontFamily:FONT_DISPLAY,fontSize:24,marginTop:18,marginBottom:8}}>Feedback Training</h2><p style={{color:C.gray3,fontSize:15,lineHeight:1.6,marginBottom:24}}>Treine suas habilidades de feedback com IA.</p><Btn onClick={startNew} style={{margin:"0 auto"}}><Icon.Plus/> Novo Treinamento</Btn>{!getKey()&&<p style={{color:C.danger,fontSize:13,marginTop:16}}>Configure sua API Key da OpenAI em ⚙️</p>}</div></div>;
    return<><div style={{flex:1,overflowY:"auto",padding:"20px 24px"}}><div style={{maxWidth:700,margin:"0 auto"}}>{messages.map((msg,i)=><div key={i} style={{display:"flex",gap:10,marginBottom:18,alignItems:"flex-start"}} className="fade-in"><div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0,background:msg.role==="assistant"?`linear-gradient(135deg,${C.green},${C.greenBright})`:C.bgInput,border:msg.role==="user"?`1px solid ${C.border}`:"none",color:C.white}}>{msg.role==="assistant"?"N":(profile?.full_name?.[0]?.toUpperCase()||"U")}</div><div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.05em",color:msg.role==="assistant"?C.green:C.gray3,marginBottom:3}}>{msg.role==="assistant"?"Nitzsche Coach":"Você"}</div><div style={{fontSize:15,lineHeight:1.65,color:C.gray1,whiteSpace:"pre-wrap"}}>{msg.content}</div></div></div>)}{isLoading&&<div style={{display:"flex",gap:10,marginBottom:18}}><div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.greenBright})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:C.white}}>N</div><div><div style={{fontSize:11,fontWeight:600,color:C.green,marginBottom:3,textTransform:"uppercase"}}>Nitzsche Coach</div><Typing/></div></div>}<div ref={chatEndRef}/></div></div>
    <div style={{padding:"14px 24px 18px",borderTop:`1px solid ${C.border}`,background:C.bgSurface}}><div style={{maxWidth:700,margin:"0 auto"}}><div style={{display:"flex",gap:10,alignItems:"flex-end"}}><textarea value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage()}}} placeholder="Digite sua mensagem..." rows={1} style={{flex:1,padding:"11px 14px",borderRadius:12,border:`1px solid ${C.border}`,background:C.bgInput,color:C.white,fontSize:15,fontFamily:FONT,outline:"none",resize:"none",minHeight:42,maxHeight:150,lineHeight:1.5,boxSizing:"border-box"}}/><button onClick={sendMessage} disabled={!chatInput.trim()||isLoading} style={{width:42,height:42,borderRadius:12,border:"none",background:`linear-gradient(135deg,${C.green},${C.greenBright})`,color:C.white,cursor:chatInput.trim()&&!isLoading?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",opacity:chatInput.trim()&&!isLoading?1:0.4,flexShrink:0}}><Icon.Send/></button></div>
    <div style={{display:"flex",gap:10,marginTop:10,alignItems:"center",flexWrap:"wrap"}}>{messages.length>=2&&<Btn small onClick={generateActionPlan} disabled={actionPlanLoading} variant="ghost" style={{border:`1px solid ${C.border}`}}>{actionPlanLoading?"Gerando...":<><Icon.Clipboard/> Gerar Plano de Ação</>}</Btn>}{actionPlan&&<Btn small onClick={()=>setShowActionPlan(true)} variant="ghost" style={{border:`1px solid ${C.green}`,color:C.green}}><Icon.Check/> Ver Plano</Btn>}{sessionTokens.input>0&&<span style={{fontSize:11,color:C.gray4,marginLeft:"auto"}}>{sessionTokens.input+sessionTokens.output} tokens · ${sessionTokens.cost.toFixed(4)}</span>}</div></div></div></>};

  const activeConv=conversations.find(c=>c.id===activeConvId);
  return(<div style={{display:"flex",height:"100vh",overflow:"hidden"}}><style>{cssBase}</style>{settingsModal}{promptModal}{planModal}
    <div style={{width:270,minWidth:270,background:C.bgSurface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",height:"100vh"}}>
      <div style={{padding:"16px 14px 12px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}><Logo size={30}/><span style={{fontFamily:FONT_DISPLAY,fontSize:17,fontWeight:700}}>Nitzsche</span></div>
      <button onClick={startNew} style={{margin:"10px 12px",padding:"10px 14px",borderRadius:10,border:`1px dashed ${C.border}`,background:"transparent",color:C.gray2,fontSize:14,fontFamily:FONT,cursor:"pointer",display:"flex",alignItems:"center",gap:8}}><Icon.Plus/> Novo Treinamento</button>
      <div style={{flex:1,overflowY:"auto",padding:"2px 6px"}}>{conversations.map(conv=><div key={conv.id} onClick={()=>resumeConv(conv)} style={{padding:"9px 10px",borderRadius:8,cursor:"pointer",marginBottom:2,fontSize:13,color:conv.id===activeConvId?C.white:C.gray2,background:conv.id===activeConvId?C.bgCard:"transparent",display:"flex",alignItems:"center",gap:7,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",transition:"all 0.15s"}}><Icon.Chat/><span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{conv.title}</span></div>)}{!conversations.length&&<p style={{fontSize:13,color:C.gray4,textAlign:"center",padding:"36px 14px",lineHeight:1.6}}>Nenhuma conversa ainda.</p>}</div>
      {profile?.is_admin&&<div style={{padding:"8px 12px",borderTop:`1px solid ${C.border}`}}><button onClick={()=>setShowPromptEditor(true)} style={{width:"100%",padding:"8px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.gray2,fontSize:12,fontFamily:FONT,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}><Icon.Edit/> Editar Prompt</button></div>}
      <div style={{padding:"10px 14px",borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}>
        <div style={{width:30,height:30,borderRadius:"50%",background:`linear-gradient(135deg,${C.green},${C.greenBright})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,flexShrink:0}}>{profile?.full_name?.[0]?.toUpperCase()||"U"}</div>
        <div style={{flex:1,overflow:"hidden"}}><div style={{fontSize:13,fontWeight:500,color:C.gray1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{profile?.full_name}</div><div style={{fontSize:11,color:C.gray4}}>{profile?.email}</div></div>
        <button onClick={()=>setShowSettings(true)} title="Configurações" style={{background:"none",border:"none",color:C.gray4,cursor:"pointer",padding:4}}><Icon.Settings/></button>
        <button onClick={signOut} title="Sair" style={{background:"none",border:"none",color:C.gray4,cursor:"pointer",padding:4}}><Icon.Logout/></button>
      </div>
    </div>
    <div style={{flex:1,display:"flex",flexDirection:"column",height:"100vh",overflow:"hidden"}}>
      <div style={{padding:"12px 22px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",background:C.bgSurface}}><span style={{fontSize:14,fontWeight:500,color:C.gray1}}>{onboardStep>0?"Novo Treinamento":activeConv?activeConv.title:"Feedback Training"}</span>{activeConv&&<span style={{fontSize:11,color:C.gray4}}>{messages.length} msgs</span>}</div>
      {onboardStep>0?renderOnboarding():renderChat()}
    </div>
  </div>);
}
