import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// CONFIG - Substitua com suas credenciais do Supabase
// ============================================================
const SUPABASE_URL = "https://uqstflzxsivifkeqdptk.supabase.co";
const SUPABASE_KEY = "sb_publishable_wzNezmXh8vHD9yBSbwnPUw_ImplTerw";

// ============================================================
// SUPABASE CLIENT SIMPLES (sem SDK - mais leve)
// ============================================================
class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
    this.token = null;
    this.user = null;
    this._loadSession();
  }

  _loadSession() {
    try {
      const stored = localStorage.getItem("sb-session");
      if (stored) {
        const session = JSON.parse(stored);
        this.token = session.access_token;
        this.user = session.user;
      }
    } catch {}
  }

  _saveSession(session) {
    this.token = session.access_token;
    this.user = session.user;
    localStorage.setItem("sb-session", JSON.stringify(session));
  }

  _clearSession() {
    this.token = null;
    this.user = null;
    localStorage.removeItem("sb-session");
  }

  async _fetch(endpoint, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      apikey: this.key,
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };
    const res = await fetch(`${this.url}${endpoint}`, { ...options, headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error_description || err.msg || err.message || `Error ${res.status}`);
    }
    return res.json();
  }

  // Auth: Sign up with email and password
  async signUp(email, password) {
    const data = await this._fetch("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) this._saveSession(data);
    return data;
  }

  // Auth: Sign in with email and password
  async signIn(email, password) {
    const data = await this._fetch("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) this._saveSession(data);
    return data;
  }

  // Auth: Sign out
  async signOut() {
    try {
      await this._fetch("/auth/v1/logout", { method: "POST" });
    } catch {}
    this._clearSession();
  }

  // Auth: Get current user
  getUser() {
    return this.user;
  }

  isAuthenticated() {
    return !!this.token;
  }

  // DB: Select
  async from(table) {
    const self = this;
    let query = "";
    let method = "GET";
    let body = null;
    let extraHeaders = {};

    const builder = {
      select(columns = "*") {
        query += `?select=${columns}`;
        return builder;
      },
      eq(col, val) {
        query += `&${col}=eq.${val}`;
        return builder;
      },
      order(col, { ascending = true } = {}) {
        query += `&order=${col}.${ascending ? "asc" : "desc"}`;
        return builder;
      },
      limit(n) {
        query += `&limit=${n}`;
        return builder;
      },
      single() {
        extraHeaders["Accept"] = "application/vnd.pgrst.object+json";
        return builder;
      },
      insert(data) {
        method = "POST";
        body = JSON.stringify(data);
        extraHeaders["Prefer"] = "return=representation";
        return builder;
      },
      update(data) {
        method = "PATCH";
        body = JSON.stringify(data);
        extraHeaders["Prefer"] = "return=representation";
        return builder;
      },
      async execute() {
        const url = `/rest/v1/${table}${query}`;
        return self._fetch(url, { method, body, headers: extraHeaders });
      },
    };
    return builder;
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
// COLORS & DESIGN TOKENS
// ============================================================
const C = {
  bg: "#080E1A",
  bgSurface: "#0C1425",
  bgCard: "#111C35",
  bgInput: "#162040",
  bgHover: "#1A2850",
  green: "#2D8B4E",
  greenBright: "#38B261",
  greenMuted: "#1B5E35",
  white: "#F2F4F8",
  gray1: "#D8DDE6",
  gray2: "#A0AAB8",
  gray3: "#6B7688",
  gray4: "#404C60",
  border: "#1A2848",
  borderFocus: "#2D8B4E",
  danger: "#D94452",
  dangerBg: "#2A1418",
  shadow: "0 8px 32px rgba(0,0,0,0.4)",
  shadowSm: "0 2px 8px rgba(0,0,0,0.3)",
};

const FONT = `'DM Sans', system-ui, sans-serif`;
const FONT_DISPLAY = `'Playfair Display', Georgia, serif`;

// ============================================================
// CLAUDE API
// ============================================================
const callClaude = async (messages, systemPrompt) => {
  const clean = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
      messages: clean,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API Error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  const usage = data.usage || {};

  return {
    text,
    inputTokens: usage.input_tokens || 0,
    outputTokens: usage.output_tokens || 0,
    cacheReadTokens: usage.cache_read_input_tokens || 0,
    cacheCreationTokens: usage.cache_creation_input_tokens || 0,
  };
};

// ============================================================
// BUILD SYSTEM PROMPT
// ============================================================
const buildPrompt = (userP, targetP, context) =>
  `Você é um coach especialista em comunicação e feedback corporativo da Nitzsche Consultoria. Seu papel é treinar o usuário a dar e receber feedback de forma eficaz, empática e assertiva.

PERFIL DO USUÁRIO (quem vai dar o feedback):
- Nome: ${userP.name}
- Idade: ${userP.age} anos
- Cargo: ${userP.role}
- Perfil de personalidade: ${userP.personality}

PERFIL DO RECEPTOR (quem vai receber o feedback):
- Idade: ${targetP.age} anos
- Cargo: ${targetP.role}
- Perfil de personalidade: ${targetP.personality}

CONTEXTO DA SITUAÇÃO:
${context}

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

// ============================================================
// SVG ICONS
// ============================================================
const Icon = {
  Send: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Plus: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Chat: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Mail: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  ),
  Tokens: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v12M6 12h12" />
    </svg>
  ),
  Arrow: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
};

const Logo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="16" fill={C.bg} stroke={C.border} strokeWidth="2" />
    <path d="M25 75V25h10l25 35V25h10v50H60L35 40v35z" fill={C.white} />
    <path d="M50 45l15 20V45h10v30H65L50 55z" fill={C.green} opacity="0.9" />
  </svg>
);

// ============================================================
// TYPING INDICATOR
// ============================================================
const Typing = () => {
  const [f, setF] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setF((v) => (v + 1) % 3), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: "flex", gap: 5, padding: "6px 0" }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.gray3, opacity: i === f ? 1 : 0.3, transform: `scale(${i === f ? 1.2 : 1})`, transition: "all 0.25s" }} />
      ))}
    </div>
  );
};

// ============================================================
// CSS BASE
// ============================================================
const cssBase = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{margin:0;background:${C.bg};font-family:${FONT};color:${C.white}}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
::selection{background:${C.green};color:white}
input:focus,textarea:focus{border-color:${C.borderFocus} !important;outline:none}
button{font-family:${FONT}}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
.fade-in{animation:fadeIn 0.3s ease}
`;

// ============================================================
// REUSABLE INPUT
// ============================================================
const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: 18 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.gray2, marginBottom: 6 }}>{label}</label>}
    <input
      {...props}
      style={{
        width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
        background: C.bgInput, color: C.white, fontSize: 15, fontFamily: FONT, outline: "none",
        transition: "border-color 0.2s", boxSizing: "border-box", ...props.style,
      }}
    />
  </div>
);

const TextArea = ({ label, ...props }) => (
  <div style={{ marginBottom: 18 }}>
    {label && <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: C.gray2, marginBottom: 6 }}>{label}</label>}
    <textarea
      {...props}
      style={{
        width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.border}`,
        background: C.bgInput, color: C.white, fontSize: 15, fontFamily: FONT, outline: "none",
        resize: "vertical", minHeight: 100, lineHeight: 1.5, boxSizing: "border-box", ...props.style,
      }}
    />
  </div>
);

const Btn = ({ children, variant = "primary", small, disabled, ...props }) => {
  const isPrimary = variant === "primary";
  return (
    <button
      disabled={disabled}
      {...props}
      style={{
        padding: small ? "8px 16px" : "12px 22px",
        borderRadius: 10,
        border: isPrimary ? "none" : `1px solid ${C.border}`,
        background: isPrimary ? `linear-gradient(135deg, ${C.green}, ${C.greenBright})` : "transparent",
        color: isPrimary ? C.white : C.gray2,
        fontSize: small ? 13 : 15,
        fontWeight: 600,
        fontFamily: FONT,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.2s",
        boxShadow: isPrimary ? `0 4px 16px rgba(45,139,78,0.25)` : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        ...props.style,
      }}
    >
      {children}
    </button>
  );
};

// ============================================================
// MAIN APP
// ============================================================
export default function NitzscheApp() {
  // Auth
  const [authState, setAuthState] = useState(supabase.isAuthenticated() ? "authenticated" : "login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" or "signup"
  const [profile, setProfile] = useState(null);

  // Conversations
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState([]);

  // Onboarding
  const [onboardStep, setOnboardStep] = useState(0);
  const [userProfile, setUserProfile] = useState({ name: "", age: "", role: "", personality: "" });
  const [targetProfile, setTargetProfile] = useState({ age: "", role: "", personality: "", knowsProfile: null });
  const [situationContext, setSituationContext] = useState("");

  // Discovery (AI profile building)
  const [discoveryMsgs, setDiscoveryMsgs] = useState([]);
  const [discoveryInput, setDiscoveryInput] = useState("");
  const [discoveryLoading, setDiscoveryLoading] = useState(false);
  const [discoveryDone, setDiscoveryDone] = useState(false);

  // Chat
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Token stats
  const [sessionTokens, setSessionTokens] = useState({ input: 0, output: 0, cached: 0, cost: 0 });

  const chatEndRef = useRef(null);
  const discoveryEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);
  useEffect(() => { discoveryEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [discoveryMsgs]);

  // Load profile on auth
  useEffect(() => {
    if (authState === "authenticated") loadProfile();
  }, [authState]);

  // Load conversations when profile ready
  useEffect(() => {
    if (profile) loadConversations();
  }, [profile]);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConvId) loadMessages(activeConvId);
    else setMessages([]);
  }, [activeConvId]);

  // ---- AUTH ----
  const handleAuth = async () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Preencha todos os campos");
      return;
    }
    if (authMode === "signup" && authPassword.length < 6) {
      setAuthError("A senha precisa ter no mínimo 6 caracteres");
      return;
    }
    setAuthLoading(true);
    setAuthError("");
    try {
      if (authMode === "signup") {
        await supabase.signUp(authEmail.trim(), authPassword.trim());
      } else {
        await supabase.signIn(authEmail.trim(), authPassword.trim());
      }
      setAuthState("authenticated");
    } catch (err) {
      if (err.message.includes("Invalid") || err.message.includes("invalid")) {
        setAuthError("E-mail ou senha incorretos");
      } else if (err.message.includes("already registered") || err.message.includes("already been registered")) {
        setAuthError("Este e-mail já está cadastrado. Faça login.");
        setAuthMode("login");
      } else {
        setAuthError(err.message);
      }
    }
    setAuthLoading(false);
  };

  const signOut = async () => {
    await supabase.signOut();
    setAuthState("login");
    setProfile(null);
    setConversations([]);
    setActiveConvId(null);
    setMessages([]);
  };

  // ---- DATA LOADING ----
  const loadProfile = async () => {
    try {
      const user = supabase.getUser();
      if (!user) return;
      const builder = await supabase.from("profiles");
      const data = await builder.select().eq("id", user.id).single().execute();
      setProfile(data);
    } catch {
      // Profile might not exist yet, create minimal
      const user = supabase.getUser();
      setProfile({ id: user?.id, email: user?.email, full_name: user?.email?.split("@")[0], is_admin: false });
    }
  };

  const loadConversations = async () => {
    try {
      const builder = await supabase.from("conversations");
      const data = await builder.select().eq("user_id", profile.id).order("last_message_at", { ascending: false }).execute();
      setConversations(data || []);
    } catch {}
  };

  const loadMessages = async (convId) => {
    try {
      const builder = await supabase.from("messages");
      const data = await builder.select().eq("conversation_id", convId).order("created_at", { ascending: true }).execute();
      setMessages(data || []);
    } catch {}
  };

  // ---- SAVE TO DB ----
  const saveConversation = async (convData) => {
    try {
      const builder = await supabase.from("conversations");
      const data = await builder.insert(convData).execute();
      return data[0];
    } catch (err) {
      console.error("Save conv error:", err);
      return null;
    }
  };

  const saveMessage = async (msgData) => {
    try {
      const builder = await supabase.from("messages");
      await builder.insert(msgData).execute();
    } catch (err) {
      console.error("Save msg error:", err);
    }
  };

  // ---- ONBOARDING ----
  const startNew = () => {
    setOnboardStep(1);
    setUserProfile({ name: profile?.full_name || "", age: profile?.age || "", role: profile?.role || "", personality: profile?.personality || "" });
    setTargetProfile({ age: "", role: "", personality: "", knowsProfile: null });
    setSituationContext("");
    setActiveConvId(null);
    setMessages([]);
    setDiscoveryMsgs([]);
    setDiscoveryDone(false);
    setSessionTokens({ input: 0, output: 0, cached: 0, cost: 0 });
  };

  const totalSteps = 5;
  const canAdvance = () => {
    switch (onboardStep) {
      case 1: return userProfile.name && userProfile.age && userProfile.role && userProfile.personality;
      case 2: return targetProfile.knowsProfile !== null;
      case 3: return targetProfile.knowsProfile ? (targetProfile.age && targetProfile.role && targetProfile.personality) : (discoveryDone && targetProfile.personality);
      case 4: return situationContext.trim().length > 20;
      case 5: return true;
      default: return false;
    }
  };

  const handleAdvance = async () => {
    if (onboardStep === 5) {
      // Create conversation in DB
      const conv = await saveConversation({
        user_id: profile.id,
        title: `Feedback → ${targetProfile.role || "Colaborador"}`,
        user_profile: userProfile,
        target_profile: targetProfile,
        situation_context: situationContext,
      });

      if (conv) {
        setConversations((prev) => [conv, ...prev]);
        setActiveConvId(conv.id);
        setOnboardStep(0);
        // Update profile with latest data
        try {
          const builder = await supabase.from("profiles");
          await builder.eq("id", profile.id).update({
            full_name: userProfile.name,
            age: parseInt(userProfile.age),
            role: userProfile.role,
            personality: userProfile.personality,
          }).execute();
        } catch {}
        // Send initial AI message
        sendInitial(conv);
      }
    } else {
      setOnboardStep((s) => s + 1);
    }
  };

  // ---- CHAT ----
  const sendInitial = async (conv) => {
    setIsLoading(true);
    try {
      const prompt = buildPrompt(conv.user_profile, conv.target_profile, conv.situation_context);
      const initMsgs = [{ role: "user", content: "Olá! Estou pronto para iniciar o treinamento de feedback. Me oriente sobre a melhor abordagem considerando os perfis e contexto informados." }];
      const result = await callClaude(initMsgs, prompt);
      const aiMsg = { conversation_id: conv.id, role: "assistant", content: result.text, input_tokens: result.inputTokens, output_tokens: result.outputTokens, cache_read_tokens: result.cacheReadTokens, cache_creation_tokens: result.cacheCreationTokens };
      await saveMessage(aiMsg);
      setMessages([{ ...aiMsg, created_at: new Date().toISOString() }]);
      updateTokenStats(result);
    } catch (err) {
      setMessages([{ role: "assistant", content: `Erro ao conectar com a IA: ${err.message}`, created_at: new Date().toISOString() }]);
    }
    setIsLoading(false);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || isLoading || !activeConvId) return;
    const text = chatInput.trim();
    setChatInput("");

    const userMsg = { conversation_id: activeConvId, role: "user", content: text, input_tokens: 0, output_tokens: 0 };
    await saveMessage(userMsg);
    const newMsgs = [...messages, { ...userMsg, created_at: new Date().toISOString() }];
    setMessages(newMsgs);

    setIsLoading(true);
    try {
      const conv = conversations.find((c) => c.id === activeConvId);
      const prompt = buildPrompt(conv.user_profile, conv.target_profile, conv.situation_context);
      const apiMsgs = newMsgs.map((m) => ({ role: m.role, content: m.content }));
      const result = await callClaude(apiMsgs, prompt);
      const aiMsg = { conversation_id: activeConvId, role: "assistant", content: result.text, input_tokens: result.inputTokens, output_tokens: result.outputTokens, cache_read_tokens: result.cacheReadTokens, cache_creation_tokens: result.cacheCreationTokens };
      await saveMessage(aiMsg);
      setMessages((prev) => [...prev, { ...aiMsg, created_at: new Date().toISOString() }]);
      updateTokenStats(result);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: `Erro: ${err.message}`, created_at: new Date().toISOString() }]);
    }
    setIsLoading(false);
  };

  const updateTokenStats = (result) => {
    setSessionTokens((prev) => ({
      input: prev.input + result.inputTokens,
      output: prev.output + result.outputTokens,
      cached: prev.cached + result.cacheReadTokens,
      cost: prev.cost + (result.inputTokens * 3 + result.outputTokens * 15 + result.cacheReadTokens * 0.3) / 1000000,
    }));
  };

  // ---- DISCOVERY ----
  const startDiscovery = async () => {
    setDiscoveryLoading(true);
    const sys = `Você ajuda a identificar perfis de personalidade no trabalho. Faça até 5 perguntas, uma por vez. Ao final, escreva "PERFIL IDENTIFICADO:" seguido do resumo. Em português.`;
    try {
      const r = await callClaude([{ role: "user", content: "Preciso de ajuda para identificar o perfil da pessoa para quem vou dar feedback." }], sys);
      setDiscoveryMsgs([{ role: "assistant", content: r.text }]);
    } catch (err) {
      setDiscoveryMsgs([{ role: "assistant", content: `Erro: ${err.message}` }]);
    }
    setDiscoveryLoading(false);
  };

  const sendDiscovery = async () => {
    if (!discoveryInput.trim() || discoveryLoading) return;
    const userMsg = { role: "user", content: discoveryInput.trim() };
    const updated = [...discoveryMsgs, userMsg];
    setDiscoveryMsgs(updated);
    setDiscoveryInput("");
    setDiscoveryLoading(true);
    const sys = `Você ajuda a identificar perfis de personalidade no trabalho. Faça até 5 perguntas, uma por vez. Ao final, escreva "PERFIL IDENTIFICADO:" seguido do resumo. Em português.`;
    try {
      const r = await callClaude(updated, sys);
      setDiscoveryMsgs([...updated, { role: "assistant", content: r.text }]);
      if (r.text.includes("PERFIL IDENTIFICADO:")) {
        setTargetProfile((p) => ({ ...p, personality: r.text.split("PERFIL IDENTIFICADO:")[1].trim() }));
        setDiscoveryDone(true);
      }
    } catch (err) {
      setDiscoveryMsgs([...updated, { role: "assistant", content: `Erro: ${err.message}` }]);
    }
    setDiscoveryLoading(false);
  };

  // ============================================================
  // RENDER: LOGIN
  // ============================================================
  if (authState !== "authenticated") {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: `radial-gradient(ellipse at 20% 20%, ${C.bgSurface} 0%, ${C.bg} 70%)`, padding: 20 }}>
        <style>{cssBase}</style>
        <div style={{ background: C.bgCard, borderRadius: 20, padding: "44px 36px", width: "100%", maxWidth: 400, border: `1px solid ${C.border}`, boxShadow: C.shadow }} className="fade-in">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <Logo size={40} />
            <div>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700 }}>Nitzsche</div>
              <div style={{ fontSize: 11, color: C.green, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Feedback Training</div>
            </div>
          </div>

          <p style={{ color: C.gray2, fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
            {authMode === "login" ? "Entre com seu e-mail e senha." : "Crie sua conta para começar o treinamento."}
          </p>

          <Input label="E-mail" type="email" placeholder="seu@empresa.com" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAuth()} />
          <Input label="Senha" type="password" placeholder={authMode === "signup" ? "Mínimo 6 caracteres" : "••••••••"} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAuth()} />

          {authError && <p style={{ color: C.danger, fontSize: 13, marginBottom: 12 }}>{authError}</p>}

          <Btn onClick={handleAuth} disabled={authLoading} style={{ width: "100%", marginBottom: 16 }}>
            {authLoading ? "Aguarde..." : authMode === "login" ? <><Icon.Lock /> Entrar</> : <><Icon.Mail /> Criar conta</>}
          </Btn>

          <button
            onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); }}
            style={{ background: "none", border: "none", color: C.gray3, fontSize: 13, cursor: "pointer", width: "100%", textAlign: "center", lineHeight: 1.6 }}
          >
            {authMode === "login" ? (
              <>Não tem conta? <span style={{ color: C.green, fontWeight: 600 }}>Cadastre-se</span></>
            ) : (
              <>Já tem conta? <span style={{ color: C.green, fontWeight: 600 }}>Faça login</span></>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: ONBOARDING
  // ============================================================
  const renderOnboarding = () => {
    const titles = ["", "Seu Perfil", "Receptor do Feedback", "Perfil do Receptor", "Contexto da Situação", "Confirmar Dados"];
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
        <div style={{ background: C.bgCard, borderRadius: 20, padding: "36px 32px", width: "100%", maxWidth: 540, border: `1px solid ${C.border}`, boxShadow: C.shadow }} className="fade-in">
          {/* Progress */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} style={{ height: 4, flex: 1, borderRadius: 4, background: s <= onboardStep ? C.green : C.border, transition: "all 0.3s" }} />
            ))}
          </div>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, marginBottom: 4 }}>{titles[onboardStep]}</h2>
          <p style={{ fontSize: 13, color: C.gray3, marginBottom: 22 }}>Etapa {onboardStep} de {totalSteps}</p>

          {onboardStep === 1 && (
            <div>
              <Input label="Nome" placeholder="Seu nome completo" value={userProfile.name} onChange={(e) => setUserProfile((p) => ({ ...p, name: e.target.value }))} />
              <Input label="Idade" type="number" placeholder="Ex: 35" value={userProfile.age} onChange={(e) => setUserProfile((p) => ({ ...p, age: e.target.value }))} />
              <Input label="Cargo" placeholder="Ex: Gerente de Vendas" value={userProfile.role} onChange={(e) => setUserProfile((p) => ({ ...p, role: e.target.value }))} />
              <TextArea label="Perfil de personalidade" placeholder="DISC, MBTI, ou descreva suas características..." value={userProfile.personality} onChange={(e) => setUserProfile((p) => ({ ...p, personality: e.target.value }))} />
            </div>
          )}

          {onboardStep === 2 && (
            <div>
              <p style={{ color: C.gray1, fontSize: 15, marginBottom: 20, lineHeight: 1.6 }}>Você conhece o perfil de personalidade da pessoa que vai receber o feedback?</p>
              <div style={{ display: "flex", gap: 12 }}>
                <Btn style={{ flex: 1 }} variant={targetProfile.knowsProfile === true ? "primary" : "ghost"} onClick={() => setTargetProfile((p) => ({ ...p, knowsProfile: true }))}>Sim, conheço</Btn>
                <Btn style={{ flex: 1 }} variant={targetProfile.knowsProfile === false ? "primary" : "ghost"} onClick={() => { setTargetProfile((p) => ({ ...p, knowsProfile: false })); if (!discoveryMsgs.length) startDiscovery(); }}>Não, preciso de ajuda</Btn>
              </div>
            </div>
          )}

          {onboardStep === 3 && targetProfile.knowsProfile && (
            <div>
              <Input label="Idade do receptor" type="number" placeholder="Ex: 28" value={targetProfile.age} onChange={(e) => setTargetProfile((p) => ({ ...p, age: e.target.value }))} />
              <Input label="Cargo" placeholder="Ex: Consultor de Vendas" value={targetProfile.role} onChange={(e) => setTargetProfile((p) => ({ ...p, role: e.target.value }))} />
              <TextArea label="Perfil de personalidade" placeholder="Descreva o perfil..." value={targetProfile.personality} onChange={(e) => setTargetProfile((p) => ({ ...p, personality: e.target.value }))} />
            </div>
          )}

          {onboardStep === 3 && targetProfile.knowsProfile === false && (
            <div>
              <div style={{ background: C.bgInput, borderRadius: 12, border: `1px solid ${C.border}`, maxHeight: 280, overflowY: "auto", marginBottom: 14, padding: 14 }}>
                {discoveryMsgs.map((m, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: m.role === "assistant" ? C.green : C.gray3, textTransform: "uppercase", marginBottom: 3 }}>
                      {m.role === "assistant" ? "Assistente" : "Você"}
                    </div>
                    <div style={{ fontSize: 14, color: C.gray1, lineHeight: 1.6 }}>{m.content}</div>
                  </div>
                ))}
                {discoveryLoading && <Typing />}
                <div ref={discoveryEndRef} />
              </div>
              {!discoveryDone ? (
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={discoveryInput} onChange={(e) => setDiscoveryInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendDiscovery()} placeholder="Sua resposta..." style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgInput, color: C.white, fontSize: 14, fontFamily: FONT, outline: "none" }} />
                  <Btn small onClick={sendDiscovery} disabled={discoveryLoading}>Enviar</Btn>
                </div>
              ) : (
                <>
                  <div style={{ background: C.bgInput, borderRadius: 10, padding: "12px 16px", marginBottom: 14, border: `1px solid ${C.green}` }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: C.green, textTransform: "uppercase", marginBottom: 6 }}>Perfil Identificado</div>
                    <div style={{ fontSize: 14, color: C.gray1, lineHeight: 1.5 }}>{targetProfile.personality}</div>
                  </div>
                  <Input label="Idade do receptor" type="number" placeholder="Ex: 28" value={targetProfile.age} onChange={(e) => setTargetProfile((p) => ({ ...p, age: e.target.value }))} />
                  <Input label="Cargo" placeholder="Ex: Consultor de Vendas" value={targetProfile.role} onChange={(e) => setTargetProfile((p) => ({ ...p, role: e.target.value }))} />
                </>
              )}
            </div>
          )}

          {onboardStep === 4 && (
            <div>
              <p style={{ color: C.gray1, fontSize: 14, marginBottom: 14, lineHeight: 1.6 }}>Descreva a situação: o que aconteceu, quando, quem estava envolvido, o impacto e o resultado esperado.</p>
              <TextArea placeholder="Ex: Na última semana, durante uma reunião de equipe..." value={situationContext} onChange={(e) => setSituationContext(e.target.value)} style={{ minHeight: 140 }} />
              <p style={{ fontSize: 12, color: C.gray4 }}>Mínimo 20 caracteres</p>
            </div>
          )}

          {onboardStep === 5 && (
            <div>
              {[
                { label: "Seu Perfil", text: `${userProfile.name}, ${userProfile.age} anos — ${userProfile.role}\n${userProfile.personality}` },
                { label: "Receptor", text: `${targetProfile.age} anos — ${targetProfile.role}\n${targetProfile.personality}` },
                { label: "Contexto", text: situationContext },
              ].map((s, i) => (
                <div key={i} style={{ background: C.bgInput, borderRadius: 10, padding: "14px 16px", marginBottom: 12, border: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: C.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 14, color: C.gray1, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{s.text}</div>
                </div>
              ))}
              <p style={{ fontSize: 13, color: C.gray3, marginTop: 8 }}>Confirme se está correto antes de iniciar.</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            {onboardStep > 1 && <Btn variant="ghost" onClick={() => setOnboardStep((s) => s - 1)} style={{ border: `1px solid ${C.border}` }}>Voltar</Btn>}
            <Btn onClick={canAdvance() ? handleAdvance : undefined} disabled={!canAdvance()} style={{ flex: 1 }}>
              {onboardStep === 5 ? "Iniciar Treinamento" : "Continuar"} <Icon.Arrow />
            </Btn>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER: CHAT
  // ============================================================
  const renderChat = () => {
    if (!activeConvId) {
      return (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
          <div style={{ textAlign: "center", maxWidth: 380 }} className="fade-in">
            <Logo size={56} />
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, marginTop: 18, marginBottom: 8 }}>Feedback Training</h2>
            <p style={{ color: C.gray3, fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>Treine suas habilidades de feedback com inteligência artificial.</p>
            <Btn onClick={startNew} style={{ margin: "0 auto" }}><Icon.Plus /> Novo Treinamento</Btn>
          </div>
        </div>
      );
    }

    return (
      <>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ maxWidth: 700, margin: "0 auto" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "flex-start" }} className="fade-in">
                <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, background: msg.role === "assistant" ? `linear-gradient(135deg, ${C.green}, ${C.greenBright})` : C.bgInput, border: msg.role === "user" ? `1px solid ${C.border}` : "none", color: C.white }}>
                  {msg.role === "assistant" ? "N" : (profile?.full_name?.[0]?.toUpperCase() || "U")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: msg.role === "assistant" ? C.green : C.gray3, marginBottom: 3 }}>
                    {msg.role === "assistant" ? "Nitzsche Coach" : "Você"}
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.65, color: C.gray1, whiteSpace: "pre-wrap" }}>{msg.content}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${C.green}, ${C.greenBright})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: C.white }}>N</div>
                <div><div style={{ fontSize: 11, fontWeight: 600, color: C.green, marginBottom: 3, textTransform: "uppercase" }}>Nitzsche Coach</div><Typing /></div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
        {/* Input */}
        <div style={{ padding: "14px 24px 18px", borderTop: `1px solid ${C.border}`, background: C.bgSurface }}>
          <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Digite sua mensagem..."
              rows={1}
              style={{ flex: 1, padding: "11px 14px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.bgInput, color: C.white, fontSize: 15, fontFamily: FONT, outline: "none", resize: "none", minHeight: 42, maxHeight: 150, lineHeight: 1.5, boxSizing: "border-box" }}
            />
            <button
              onClick={sendMessage}
              disabled={!chatInput.trim() || isLoading}
              style={{ width: 42, height: 42, borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.green}, ${C.greenBright})`, color: C.white, cursor: chatInput.trim() && !isLoading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", opacity: chatInput.trim() && !isLoading ? 1 : 0.4, transition: "opacity 0.2s", flexShrink: 0 }}
            >
              <Icon.Send />
            </button>
          </div>
          {/* Token counter */}
          {sessionTokens.input > 0 && (
            <div style={{ maxWidth: 700, margin: "8px auto 0", display: "flex", gap: 14, fontSize: 11, color: C.gray4 }}>
              <span><Icon.Tokens /> {sessionTokens.input + sessionTokens.output} tokens</span>
              {sessionTokens.cached > 0 && <span style={{ color: C.green }}>⚡ {sessionTokens.cached} cached</span>}
              <span>≈ ${sessionTokens.cost.toFixed(4)}</span>
            </div>
          )}
        </div>
      </>
    );
  };

  // ============================================================
  // RENDER: MAIN LAYOUT
  // ============================================================
  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <style>{cssBase}</style>

      {/* Sidebar */}
      <div style={{ width: 270, minWidth: 270, background: C.bgSurface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", height: "100vh" }}>
        <div style={{ padding: "16px 14px 12px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={30} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 700 }}>Nitzsche</span>
        </div>

        <button onClick={startNew} style={{ margin: "10px 12px", padding: "10px 14px", borderRadius: 10, border: `1px dashed ${C.border}`, background: "transparent", color: C.gray2, fontSize: 14, fontFamily: FONT, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
          <Icon.Plus /> Novo Treinamento
        </button>

        <div style={{ flex: 1, overflowY: "auto", padding: "2px 6px" }}>
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => { setActiveConvId(conv.id); setOnboardStep(0); }}
              style={{ padding: "9px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2, fontSize: 13, color: conv.id === activeConvId ? C.white : C.gray2, background: conv.id === activeConvId ? C.bgCard : "transparent", display: "flex", alignItems: "center", gap: 7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", transition: "all 0.15s" }}
            >
              <Icon.Chat />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{conv.title}</span>
            </div>
          ))}
          {!conversations.length && (
            <p style={{ fontSize: 13, color: C.gray4, textAlign: "center", padding: "36px 14px", lineHeight: 1.6 }}>
              Nenhuma conversa ainda.
            </p>
          )}
        </div>

        <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${C.green}, ${C.greenBright})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
            {profile?.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.gray1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.full_name}</div>
            <div style={{ fontSize: 11, color: C.gray4 }}>{profile?.email}</div>
          </div>
          <button onClick={signOut} title="Sair" style={{ background: "none", border: "none", color: C.gray4, cursor: "pointer", padding: 4 }}>
            <Icon.Logout />
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        <div style={{ padding: "12px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bgSurface }}>
          <span style={{ fontSize: 14, fontWeight: 500, color: C.gray1 }}>
            {onboardStep > 0 ? "Novo Treinamento" : activeConv ? activeConv.title : "Feedback Training"}
          </span>
          {activeConv && (
            <span style={{ fontSize: 11, color: C.gray4 }}>
              {activeConv.message_count || messages.length} mensagens
            </span>
          )}
        </div>

        {onboardStep > 0 ? renderOnboarding() : renderChat()}
      </div>
    </div>
  );
}
