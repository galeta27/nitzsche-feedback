import { useState } from "react";

const QUESTIONS = [
  {block:"Superfície Observável",title:"No dia a dia, essa pessoa tende a se comunicar de que forma?",maxSelect:2,options:[
    {id:"1a",text:"Vai mais direto ao ponto e costuma falar de forma objetiva",disc:"D"},
    {id:"1b",text:"Costuma envolver os outros com entusiasmo, conversa e persuasão",disc:"I"},
    {id:"1c",text:"Fala de forma calma, cuidadosa e sem pressa",disc:"S"},
    {id:"1d",text:"Costuma se expressar com lógica, detalhes e atenção ao que está correto",disc:"C"}]},
  {block:"Superfície Observável",title:"Quando precisa agir no trabalho, essa pessoa tende a:",maxSelect:2,options:[
    {id:"2a",text:"Agir rápido e assumir a frente",disc:"D"},
    {id:"2b",text:"Mobilizar pessoas e criar entusiasmo",disc:"I"},
    {id:"2c",text:"Manter constância e evitar rupturas",disc:"S"},
    {id:"2d",text:"Conferir critérios antes de avançar",disc:"C"}]},
  {block:"Superfície Observável",title:"Como essa pessoa costuma tomar decisões?",maxSelect:2,options:[
    {id:"3a",text:"Decide rapidamente e ajusta depois",func:"decisão rápida"},
    {id:"3b",text:"Decide considerando o impacto sobre as pessoas e o clima",func:"decisão relacional"},
    {id:"3c",text:"Decide com cautela, buscando segurança",func:"decisão prudente"},
    {id:"3d",text:"Decide com base em lógica, dados e coerência",func:"decisão lógica/analítica"}]},
  {block:"Superfície Observável",title:"Essa pessoa tende a:",maxSelect:2,options:[
    {id:"4a",text:"Trabalhar com rapidez e senso de urgência",func:"ritmo rápido"},
    {id:"4b",text:"Alternar a intensidade conforme o estímulo, as pessoas e a situação",func:"ritmo variável/social"},
    {id:"4c",text:"Manter um ritmo estável e previsível",func:"ritmo estável"},
    {id:"4d",text:"Trabalhar com atenção, revisão e precisão",func:"ritmo cuidadoso"}]},
  {block:"Funcionamento Prático",title:"Quando aparecem mudanças, essa pessoa:",maxSelect:2,options:[
    {id:"5a",text:"Costuma aceitar quando enxerga um ganho claro",func:"abertura condicional/pragmática"},
    {id:"5b",text:"Costuma gostar quando a mudança traz novidade e movimento",func:"abertura alta"},
    {id:"5c",text:"Prefere ter tempo para se adaptar",func:"abertura baixa ou moderada"},
    {id:"5d",text:"Costuma questionar bastante antes de aderir",func:"abertura baixa/analítica"}]},
  {block:"Funcionamento Prático",title:"Sob pressão, essa pessoa tende a:",maxSelect:2,options:[
    {id:"6a",text:"Endurecer, cobrar mais ou querer resolver logo",func:"pressão dominante"},
    {id:"6b",text:"Falar mais, se justificar ou tentar sustentar a energia do ambiente",func:"pressão expansiva"},
    {id:"6c",text:"Se retrair, absorver ou evitar conflito",func:"pressão sensível/recuo"},
    {id:"6d",text:"Se defender com argumentos, lógica ou muitos detalhes",func:"defesa racional"}]},
  {block:"Funcionamento Prático",title:"Em relação a processos e regras, essa pessoa tende a:",maxSelect:2,options:[
    {id:"7a",text:"Seguir quando enxerga utilidade prática",func:"adesão pragmática"},
    {id:"7b",text:"Flexibilizar quando acha que atrapalha",func:"risco de atalhos"},
    {id:"7c",text:"Gostar de clareza e previsibilidade",func:"busca por segurança/constância"},
    {id:"7d",text:"Valorizar padrão, critério e consistência",func:"alta valorização de processo"}]},
  {block:"Funcionamento Prático",title:"No convívio com colegas e liderança, essa pessoa:",maxSelect:2,options:[
    {id:"8a",text:"Costuma se posicionar com firmeza, mesmo que isso gere atrito",func:"assertividade alta / risco de atrito"},
    {id:"8b",text:"Costuma influenciar os outros pelo entusiasmo e pela fala",func:"influência social"},
    {id:"8c",text:"Costuma cooperar e buscar harmonia",func:"cooperação alta"},
    {id:"8d",text:"Costuma ser mais reservada e manter seu próprio critério",func:"reserva / independência"}]},
  {block:"Funcionamento Prático",title:"Quando recebe feedback, essa pessoa tende a:",maxSelect:2,options:[
    {id:"9a",text:"Escutar, mas reagir se achar injusto",func:"defesa por senso de justiça"},
    {id:"9b",text:"Precisar sentir reconhecimento antes do ajuste",func:"sensibilidade a reconhecimento"},
    {id:"9c",text:"Aceitar melhor quando há segurança e respeito",func:"receptividade relacional"},
    {id:"9d",text:"Aceitar melhor quando há fatos, lógica e clareza",func:"receptividade factual"}]},
  {block:"Motivadores",title:"No dia a dia, essa pessoa parece mais movida por:",maxSelect:3,options:[
    {id:"10a",text:"Resultado e metas",func:"resultado"},
    {id:"10b",text:"Reconhecimento e visibilidade",func:"reconhecimento"},
    {id:"10c",text:"Segurança e previsibilidade",func:"segurança"},
    {id:"10d",text:"Autonomia para fazer do próprio jeito",func:"autonomia"},
    {id:"10e",text:"Pertencimento e boa convivência",func:"pertencimento"},
    {id:"10f",text:"Crescimento e aprendizado",func:"crescimento"}]}
];

const DISC_DESC={D:"tende a ser objetivo, firme e orientado a resultado",I:"tende a ser comunicativo, persuasivo e voltado à interação",S:"tende a ser calmo, constante e colaborativo",C:"tende a ser lógico, criterioso e orientado a qualidade",DI:"tende a ser objetivo, persuasivo e orientado à ação",ID:"tende a ser comunicativo, enérgico e rápido para agir",DC:"tende a ser objetivo, lógico e orientado a resultado",CD:"tende a ser criterioso, analítico e firme ao se posicionar",DS:"tende a ser firme, estável e orientado a conduzir com constância",SD:"tende a ser constante, firme e confiável na execução",IS:"tende a ser comunicativo, acolhedor e agregador",SI:"tende a ser colaborativo, estável e gentil na interação",IC:"tende a ser comunicativo, observador e atento à forma de se expressar",CI:"tende a ser lógico, reservado e cuidadoso na comunicação",SC:"tende a ser calmo, organizado e atento à qualidade",CS:"tende a ser criterioso, estável e cuidadoso na execução"};

const calculateProfile=(answers,openAnswers)=>{
  const ds={D:0,I:0,S:0,C:0};
  [0,1].forEach(qi=>{(answers[qi]||[]).forEach(oid=>{const o=QUESTIONS[qi].options.find(x=>x.id===oid);if(o?.disc)ds[o.disc]++})});
  const sorted=Object.entries(ds).sort((a,b)=>b[1]-a[1]);
  let dp=sorted[0][0],ds2=sorted[1][1]>0?sorted[1][0]:null;
  let dc=ds2&&sorted[1][1]>=sorted[0][1]*0.5?dp+ds2:dp;
  let dd=DISC_DESC[dc]||DISC_DESC[dp];
  const fm={2:"decisao",3:"ritmo",4:"mudancas",5:"pressao",6:"processos",7:"convivio",8:"feedback_recepcao"};
  const ff={};
  Object.entries(fm).forEach(([qi,f])=>{const v=(answers[parseInt(qi)]||[]).map(oid=>{const o=QUESTIONS[parseInt(qi)].options.find(x=>x.id===oid);return o?.func||""}).filter(Boolean);ff[f]=v.join(" / ")||"não identificado"});
  const mot=(answers[9]||[]).map(oid=>{const o=QUESTIONS[9].options.find(x=>x.id===oid);return o?.func||""}).filter(Boolean);
  let ba="clara e respeitosa",rk="manter acompanhamento para sustentação da mudança";
  if(dp==="D"){ba="direta, objetiva e focada em resultado";rk="pode reagir se sentir que está sendo controlado ou injustiçado"}
  else if(dp==="I"){ba="com reconhecimento primeiro, depois o ajuste, em tom leve";rk="pode concordar no momento e não manter a mudança"}
  else if(dp==="S"){ba="em ambiente seguro, com respeito e sem pressão";rk="pode aceitar sem discordar, mas absorver emocionalmente"}
  else if(dp==="C"){ba="com fatos, dados e lógica clara";rk="pode se defender com argumentos e questionar a validade do feedback"}
  const com=(answers[0]||[]).map(oid=>{const o=QUESTIONS[0].options.find(x=>x.id===oid);return o?.text?.toLowerCase()||""}).join(" e ")||"não identificada";
  return{discCode:dc,discDescription:dd,comunicacao:com,ritmo:ff.ritmo,decisao:ff.decisao,mudancas:ff.mudancas,pressao:ff.pressao,processos:ff.processos,convivio:ff.convivio,feedbackRecepcao:ff.feedback_recepcao,motivators:mot,bestApproach:ba,risk:rk,openStrength:openAnswers.strength||"",openChallenge:openAnswers.challenge||""}
};

const profileToText=(p,ctx)=>{
  let t=`PERFIL COMPORTAMENTAL DO RECEPTOR:\n`;
  t+=`Estilo predominante: ${p.discCode} — ${p.discDescription}\n`;
  t+=`Comunicação: ${p.comunicacao}\nRitmo: ${p.ritmo}\nDecisão: ${p.decisao}\nMudanças: ${p.mudancas}\n`;
  t+=`Sob pressão: ${p.pressao}\nProcessos: ${p.processos}\nConvívio: ${p.convivio}\n`;
  t+=`Recepção a feedback: ${p.feedbackRecepcao}\nMotivadores: ${p.motivators.join(", ")}\n`;
  t+=`Melhor abordagem: ${p.bestApproach}\nRisco: ${p.risk}\n`;
  if(p.openStrength)t+=`Ponto forte: ${p.openStrength}\n`;
  if(p.openChallenge)t+=`Ponto de atenção: ${p.openChallenge}\n`;
  if(ctx?.behavior)t+=`\nCONTEXTO DO FUNCIONÁRIO:\nComportamento geral: ${ctx.behavior}\n`;
  if(ctx?.commitment)t+=`Comprometimento: ${ctx.commitment}\n`;
  if(ctx?.performance)t+=`Resultados/performance: ${ctx.performance}\n`;
  if(ctx?.relationship)t+=`Relacionamento: ${ctx.relationship}\n`;
  if(ctx?.contextNotes)t+=`Observações adicionais: ${ctx.contextNotes}\n`;
  return t;
};

const situationToText=(sit)=>{
  if(!sit||sit.wantsStory)return sit?.wantsStory?"O usuário escolheu uma história criada pela IA.":"";
  let t=`SITUAÇÃO DESCRITA (Ciclo da Comunicação Consciente):\n`;
  if(sit.facts)t+=`\nObservação neutra (fatos): ${sit.facts}\n`;
  if(sit.causes)t+=`Causas percebidas: ${sit.causes}\n`;
  if(sit.frequency)t+=`Frequência: ${sit.frequency}\n`;
  if(sit.riskLevel)t+=`Grau de risco: ${sit.riskLevel}\n`;
  if(sit.impacts?.length){t+=`Impactos: ${sit.impacts.join(", ")}\n`;if(sit.impactDetails)t+=`Detalhes do impacto: ${sit.impactDetails}\n`}
  if(sit.emotion)t+=`\nEmoção interna do gestor: ${sit.emotion}\n`;
  if(sit.intentSelf||sit.intentPerson||sit.intentTeam){
    t+=`\nIntenção Tripla (resultado positivo desejado):\n`;
    if(sit.intentSelf)t+=`- Para mim: ${sit.intentSelf}\n`;
    if(sit.intentPerson)t+=`- Para a pessoa: ${sit.intentPerson}\n`;
    if(sit.intentTeam)t+=`- Para a empresa/time: ${sit.intentTeam}\n`;
  }
  return t;
};

export {QUESTIONS,calculateProfile,profileToText,situationToText};

export default function ProfileAssessment({colors:C,onComplete,onCancel,Font}){
  const[step,setStep]=useState("basic");
  // Basic
  const[tName,setTName]=useState("");
  const[tAge,setTAge]=useState("");
  const[tRole,setTRole]=useState("");
  // About employee
  const[behavior,setBehavior]=useState("");
  const[commitment,setCommitment]=useState("");
  const[performance,setPerformance]=useState("");
  const[relationship,setRelationship]=useState("");
  const[contextNotes,setContextNotes]=useState("");
  // DISC
  const[answers,setAnswers]=useState({});
  const[discPage,setDiscPage]=useState(0); // 0-4 (2 questions per page)
  // Motivators + Open
  const[openAnswers,setOpenAnswers]=useState({strength:"",challenge:""});
  // Situation choice
  const[wantsStory,setWantsStory]=useState(null);
  // Situation details (Ciclo Comunicação Consciente)
  const[facts,setFacts]=useState("");
  const[causes,setCauses]=useState("");
  const[frequency,setFrequency]=useState("");
  const[riskLevel,setRiskLevel]=useState("");
  const[impacts,setImpacts]=useState([]);
  const[impactDetails,setImpactDetails]=useState("");
  const[emotion,setEmotion]=useState("");
  const[intentSelf,setIntentSelf]=useState("");
  const[intentPerson,setIntentPerson]=useState("");
  const[intentTeam,setIntentTeam]=useState("");
  // Result
  const[resultProfile,setResultProfile]=useState(null);
  const[expanded,setExpanded]=useState(false);

  const totalPages=13;
  const stepMap={basic:1,about:2,disc:3,motOpen:8,choice:9,situation:10,impact:11,emotion:12,result:13};
  const curPage=step==="disc"?3+discPage:stepMap[step]||1;
  const progress=(curPage/totalPages)*100;

  const toggle=(qi,oid)=>{const mx=QUESTIONS[qi].maxSelect;setAnswers(p=>{const c=p[qi]||[];if(c.includes(oid))return{...p,[qi]:c.filter(x=>x!==oid)};if(c.length>=mx)return p;return{...p,[qi]:[...c,oid]}})};
  const isSel=(qi,oid)=>(answers[qi]||[]).includes(oid);
  const hasAns=(qi)=>(answers[qi]||[]).length>0;
  const toggleImpact=(v)=>setImpacts(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);

  const handleFinish=()=>{setResultProfile(calculateProfile(answers,openAnswers));setStep("result")};
  const handleConfirm=()=>{
    const prof=resultProfile;
    const ctx={behavior,commitment,performance,relationship,contextNotes};
    const sit=wantsStory?{wantsStory:true}:{wantsStory:false,facts,causes,frequency,riskLevel,impacts,impactDetails,emotion,intentSelf,intentPerson,intentTeam};
    onComplete&&onComplete({
      age:tAge,role:tRole,name:tName,
      personality:profileToText(prof,ctx),profileData:prof,
      situation:situationToText(sit),wantsStory,
      employeeContext:ctx,situationData:sit
    });
  };

  // Shared styles
  const card={background:C.bgCard,borderRadius:20,padding:"32px 28px",width:"100%",maxWidth:620,border:`1px solid ${C.border}`,boxShadow:C.shadow,maxHeight:"85vh",overflowY:"auto"};
  const bar=<div style={{height:4,background:C.border,borderRadius:4,marginBottom:24}}><div style={{height:4,background:C.green,borderRadius:4,width:`${progress}%`,transition:"width 0.3s"}}/></div>;
  const bp=(dis)=>({flex:1,padding:"12px 22px",borderRadius:10,border:"none",background:dis?C.gray4:`linear-gradient(135deg,${C.green},${C.greenBright})`,color:C.white,fontSize:15,fontWeight:600,fontFamily:Font,cursor:dis?"not-allowed":"pointer",opacity:dis?0.4:1,boxShadow:"0 4px 16px rgba(45,139,78,0.25)"});
  const bg={padding:"12px 22px",borderRadius:10,border:`1px solid ${C.border}`,background:"transparent",color:C.gray2,fontSize:15,fontFamily:Font,cursor:"pointer"};
  const inp={width:"100%",padding:"11px 14px",borderRadius:10,border:`1px solid ${C.border}`,background:C.bgInput,color:C.white,fontSize:16,fontFamily:Font,outline:"none",boxSizing:"border-box"};
  const ta={...inp,minHeight:80,resize:"vertical",lineHeight:1.5};
  const lb={display:"block",fontSize:14,fontWeight:500,color:C.gray2,marginBottom:6};
  const ob=(s)=>({width:"100%",padding:"11px 16px",borderRadius:10,border:`1.5px solid ${s?C.green:C.border}`,background:s?C.bgInput:"transparent",color:s?C.white:C.gray2,fontSize:15,fontFamily:Font,cursor:"pointer",textAlign:"left",transition:"all 0.15s",display:"flex",alignItems:"center",gap:10,marginBottom:6});
  const cb=(s)=>({width:20,height:20,borderRadius:5,border:`2px solid ${s?C.green:C.gray4}`,background:s?C.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.15s"});
  const chk=<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;
  const hd=(t)=><h2 style={{fontFamily:`'Playfair Display',Georgia,serif`,fontSize:22,marginBottom:6}}>{t}</h2>;
  const sub=(t)=><p style={{fontSize:14,color:C.gray3,marginBottom:20}}>{t}</p>;
  const fg=(l,ch)=><div style={{marginBottom:16}}><label style={lb}>{l}</label>{ch}</div>;
  const wrap=(content,back,next,nextDis)=>(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24,overflowY:"auto"}}>
      <div style={card} className="fade-in">{bar}{content}
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button onClick={back} style={bg}>Voltar</button>
          <button onClick={next} disabled={nextDis} style={bp(nextDis)}>Continuar →</button>
        </div>
        <div style={{fontSize:12,color:C.gray4,marginTop:12,textAlign:"center"}}>Etapa {curPage} de {totalPages}</div>
      </div>
    </div>);

  // Pill button for about employee
  const pill=(label,val,setter,options)=>(
    <div style={{marginBottom:16}}>
      <label style={lb}>{label}</label>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {options.map(o=><button key={o} onClick={()=>setter(o)} style={{padding:"8px 14px",borderRadius:20,border:`1.5px solid ${val===o?C.green:C.border}`,background:val===o?C.bgInput:"transparent",color:val===o?C.white:C.gray2,fontSize:14,fontFamily:Font,cursor:"pointer",transition:"all 0.15s"}}>{o}</button>)}
      </div>
    </div>);

  // ============ TELA 1: BASIC ============
  if(step==="basic")return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24,overflowY:"auto"}}>
      <div style={card} className="fade-in">{bar}
        {hd("Pessoa que irá receber o feedback")}
        {sub("Preencha os dados básicos.")}
        {fg("Nome (opcional)",<input type="text" placeholder="Ex: João" value={tName} onChange={e=>setTName(e.target.value)} style={inp}/>)}
        {fg("Idade",<input type="number" placeholder="Ex: 28" value={tAge} onChange={e=>setTAge(e.target.value)} style={inp}/>)}
        {fg("Cargo",<input type="text" placeholder="Ex: Consultor de Vendas" value={tRole} onChange={e=>setTRole(e.target.value)} style={inp}/>)}
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button onClick={onCancel} style={bg}>Cancelar</button>
          <button onClick={()=>setStep("about")} disabled={!tAge||!tRole} style={bp(!tAge||!tRole)}>Continuar →</button>
        </div>
      </div>
    </div>);

  // ============ TELA 2: ABOUT EMPLOYEE ============
  if(step==="about")return wrap(<>
    {hd("Sobre o funcionário")}
    {sub("Como essa pessoa costuma ser no trabalho? Escolha a opção mais próxima.")}
    {pill("Comportamento geral",behavior,setBehavior,["Proativo e engajado","Reservado e focado nas tarefas","Comunicativo e bom de relacionamento","Demonstra iniciativa mas tem dificuldade em seguir processos"])}
    {pill("Comprometimento",commitment,setCommitment,["Muito comprometido","Cumpre o esperado","Irregular","Parece desmotivado"])}
    {pill("Resultados e performance",performance,setPerformance,["Supera as metas","Atinge as expectativas","Irregular","Abaixo do esperado"])}
    {pill("Relacionamento no serviço",relationship,setRelationship,["Colaborativo com todos","Bom com clientes, reservado com colegas","Tende a ser conflituoso","Mantém bom relacionamento com a gestão"])}
    {fg("Algo mais que queira comentar? (opcional)",<textarea value={contextNotes} onChange={e=>setContextNotes(e.target.value)} placeholder="Ex: É funcionário há 10 anos, tem passado por questões pessoais..." style={ta}/>)}
  </>,()=>setStep("basic"),()=>{setDiscPage(0);setStep("disc")},!behavior||!commitment||!performance||!relationship);

  // ============ TELAS 3-7: DISC (2 per page) ============
  if(step==="disc"){
    const qi1=discPage*2;
    const qi2=discPage*2+1;
    const q1=QUESTIONS[qi1];
    const q2=qi2<9?QUESTIONS[qi2]:null; // questions 0-8 (not motivators)
    const isLast=discPage===4; // page 4 = questions 8,9 but 9 is motivators handled in motOpen
    const showQ2=q2&&qi2<9;
    const canNext=hasAns(qi1)&&(!showQ2||hasAns(qi2));
    const prevBlock=qi1>0?QUESTIONS[qi1-1].block:"";
    const showBlock=q1.block!==prevBlock;

    return wrap(<>
      {showBlock&&<div style={{fontSize:11,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8}}>{q1.block}</div>}
      <h3 style={{fontFamily:`'Playfair Display',Georgia,serif`,fontSize:18,marginBottom:4}}>{q1.title}</h3>
      <p style={{fontSize:13,color:C.gray3,marginBottom:12}}>Marque até {q1.maxSelect} opções. Se ficar em dúvida, escolha o que aparece com mais frequência no trabalho.</p>
      <div style={{marginBottom:showQ2?20:0}}>
        {q1.options.map(o=><button key={o.id} onClick={()=>toggle(qi1,o.id)} style={ob(isSel(qi1,o.id))}><div style={cb(isSel(qi1,o.id))}>{isSel(qi1,o.id)&&chk}</div><span>{o.text}</span></button>)}
      </div>
      {showQ2&&<>
        {q2.block!==q1.block&&<div style={{fontSize:11,fontWeight:700,color:C.green,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:8,marginTop:8}}>{q2.block}</div>}
        <h3 style={{fontFamily:`'Playfair Display',Georgia,serif`,fontSize:18,marginBottom:4}}>{q2.title}</h3>
        <p style={{fontSize:13,color:C.gray3,marginBottom:12}}>Marque até {q2.maxSelect} opções.</p>
        <div>{q2.options.map(o=><button key={o.id} onClick={()=>toggle(qi2,o.id)} style={ob(isSel(qi2,o.id))}><div style={cb(isSel(qi2,o.id))}>{isSel(qi2,o.id)&&chk}</div><span>{o.text}</span></button>)}</div>
      </>}
    </>,()=>{if(discPage>0)setDiscPage(p=>p-1);else setStep("about")},
      ()=>{if(discPage<4)setDiscPage(p=>p+1);else setStep("motOpen")},!canNext);
  }

  // ============ TELA 8: MOTIVATORS + OPEN ============
  if(step==="motOpen"){
    const mq=QUESTIONS[9];
    return wrap(<>
      {hd("Motivadores e observações")}
      <h3 style={{fontFamily:`'Playfair Display',Georgia,serif`,fontSize:18,marginBottom:4}}>{mq.title}</h3>
      <p style={{fontSize:13,color:C.gray3,marginBottom:12}}>Marque até 3 opções que mais combinam com a pessoa.</p>
      <div style={{marginBottom:20}}>
        {mq.options.map(o=><button key={o.id} onClick={()=>toggle(9,o.id)} style={ob(isSel(9,o.id))}><div style={cb(isSel(9,o.id))}>{isSel(9,o.id)&&chk}</div><span>{o.text}</span></button>)}
      </div>
      {fg("O que essa pessoa faz muito bem no trabalho? (opcional)",<textarea value={openAnswers.strength} onChange={e=>setOpenAnswers(p=>({...p,strength:e.target.value}))} placeholder="Descreva livremente..." style={ta}/>)}
      {fg("O que mais costuma dificultar o desempenho ou a evolução dela? (opcional)",<textarea value={openAnswers.challenge} onChange={e=>setOpenAnswers(p=>({...p,challenge:e.target.value}))} placeholder="Descreva livremente..." style={ta}/>)}
    </>,()=>setDiscPage(4)||setStep("disc"),()=>setStep("choice"),!hasAns(9));
  }

  // ============ TELA 9: CHOICE ============
  if(step==="choice")return wrap(<>
    {hd("Contexto do feedback")}
    {sub("Como deseja começar o treinamento?")}
    <div style={{display:"flex",gap:10,marginBottom:16}}>
      <button onClick={()=>setWantsStory(false)} style={{...ob(wantsStory===false),flex:1,justifyContent:"center",fontWeight:600}}>Tenho uma situação real</button>
      <button onClick={()=>setWantsStory(true)} style={{...ob(wantsStory===true),flex:1,justifyContent:"center",fontWeight:600}}>Quero uma história</button>
    </div>
    {wantsStory===true&&<div style={{background:C.bgInput,borderRadius:10,padding:"14px 16px",border:`1px solid ${C.green}33`}}>
      <p style={{fontSize:14,color:C.gray1,lineHeight:1.6}}>A IA vai criar uma história personalizada com base no perfil que você construiu. Você poderá fazer escolhas ao longo da narrativa.</p>
    </div>}
    {wantsStory===false&&<p style={{fontSize:14,color:C.gray1,lineHeight:1.6}}>Nas próximas etapas vamos descrever a situação de forma estruturada, seguindo o Ciclo da Comunicação Consciente.</p>}
  </>,()=>setStep("motOpen"),()=>{if(wantsStory)handleFinish();else setStep("situation")},wantsStory===null);

  // ============ TELA 10: SITUATION (Observação neutra + causas) ============
  if(step==="situation")return wrap(<>
    {hd("Observação neutra")}
    <p style={{fontSize:14,color:C.gray1,marginBottom:6,lineHeight:1.6}}>Descreva o que aconteceu de forma objetiva — <strong style={{color:C.green}}>fatos e ações observáveis</strong>, sem julgamentos.</p>
    <p style={{fontSize:13,color:C.gray3,marginBottom:14,lineHeight:1.5}}>
      ✓ "Na reunião de segunda, ele interrompeu o colega 3 vezes durante a apresentação."<br/>
      ✗ "Ele foi grosso e desrespeitoso na reunião."
    </p>
    {fg("O que aconteceu? (fatos)",<textarea value={facts} onChange={e=>setFacts(e.target.value)} placeholder="Descreva o ocorrido de forma específica e baseada em evidências..." style={{...ta,minHeight:100}}/>)}
    {fg("Causas percebidas (o que você acha que levou ao fato)",<textarea value={causes} onChange={e=>setCauses(e.target.value)} placeholder="Ex: Falta de atenção, pressão do cliente, desconhecimento de um procedimento..." style={ta}/>)}
  </>,()=>setStep("choice"),()=>setStep("impact"),facts.length<20);

  // ============ TELA 11: IMPACT + FREQUENCY + RISK ============
  if(step==="impact"){
    const freqOpts=["Primeira vez","Pontual","Ocasional (1-2x por mês)","Recorrente (semanal ou mais)"];
    const riskOpts=["Baixo","Médio","Alto","Crítico"];
    const impactOpts=["Resultado/metas","Equipe","Cliente","Processo","Gestor"];
    return wrap(<>
      {hd("Impacto e frequência")}
      {pill("Com que frequência isso acontece?",frequency,setFrequency,freqOpts)}
      {pill("Grau de risco",riskLevel,setRiskLevel,riskOpts)}
      <div style={{marginBottom:16}}>
        <label style={lb}>Áreas impactadas (marque todas que se aplicam)</label>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
          {impactOpts.map(o=><button key={o} onClick={()=>toggleImpact(o)} style={{padding:"8px 14px",borderRadius:20,border:`1.5px solid ${impacts.includes(o)?C.green:C.border}`,background:impacts.includes(o)?C.bgInput:"transparent",color:impacts.includes(o)?C.white:C.gray2,fontSize:14,fontFamily:Font,cursor:"pointer",transition:"all 0.15s"}}>{o}</button>)}
        </div>
      </div>
      {fg("Detalhes do impacto (opcional)",<textarea value={impactDetails} onChange={e=>setImpactDetails(e.target.value)} placeholder="Descreva os efeitos concretos: perda de venda, reclamação do cliente, clima na equipe..." style={ta}/>)}
    </>,()=>setStep("situation"),()=>setStep("emotion"),!frequency||!riskLevel);
  }

  // ============ TELA 12: EMOTION + INTENTION ============
  if(step==="emotion")return wrap(<>
    {hd("Emoção e intenção")}
    <div style={{background:C.bgInput,borderRadius:10,padding:"12px 16px",marginBottom:16,borderLeft:`3px solid ${C.green}`}}>
      <p style={{fontSize:14,color:C.gray1,lineHeight:1.6,fontStyle:"italic"}}>Lembre-se: são os <strong style={{color:C.green}}>problemas</strong> que nos deixam com raiva, frustração, estresse e preocupação. As <strong style={{color:C.green}}>pessoas</strong> são parte da solução.</p>
    </div>
    {fg("O que você sentiu com essa situação?",<textarea value={emotion} onChange={e=>setEmotion(e.target.value)} placeholder="Nomeie seus sentimentos: frustração, preocupação, decepção, ansiedade..." style={ta}/>)}
    <div style={{marginTop:8,marginBottom:8}}>
      <label style={{...lb,fontSize:15,color:C.white}}>Intenção Tripla — Qual o resultado positivo que você deseja para cada parte?</label>
    </div>
    {fg("Para você",<input type="text" value={intentSelf} onChange={e=>setIntentSelf(e.target.value)} placeholder="Ex: Mais tranquilidade na gestão, poder confiar na execução" style={inp}/>)}
    {fg("Para a pessoa",<input type="text" value={intentPerson} onChange={e=>setIntentPerson(e.target.value)} placeholder="Ex: Crescer profissionalmente, ser reconhecida pelo potencial" style={inp}/>)}
    {fg("Para a empresa/time",<input type="text" value={intentTeam} onChange={e=>setIntentTeam(e.target.value)} placeholder="Ex: Clima melhor, resultados mais consistentes" style={inp}/>)}
  </>,()=>setStep("impact"),()=>handleFinish(),!emotion||!intentSelf||!intentPerson||!intentTeam);

  // ============ TELA 13: RESULT ============
  if(step==="result"&&resultProfile){
    const p=resultProfile;
    return(
    <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24,overflowY:"auto"}}>
      <div style={card} className="fade-in">
        {hd("Perfil Identificado")}
        {sub(`${tName?tName+" — ":""}${tRole}, ${tAge} anos`)}
        <div style={{background:C.bgInput,borderRadius:12,padding:"16px 20px",border:`1px solid ${C.border}`,marginBottom:12}}>
          <div style={{marginBottom:10}}>
            <span style={{fontSize:12,fontWeight:600,color:C.green,textTransform:"uppercase",letterSpacing:"0.06em"}}>Estilo predominante</span>
            <div style={{fontSize:17,fontWeight:700,color:C.white,marginTop:2}}>{p.discCode} — <span style={{fontWeight:400,color:C.gray1}}>{p.discDescription}</span></div>
          </div>
          {[["Comunicação",p.comunicacao],["Ritmo",p.ritmo],["Decisão",p.decisao],["Mudanças",p.mudancas],["Motivadores",p.motivators.join(", ")]].map(([l,v],i)=>
            <div key={i} style={{display:"flex",fontSize:14,marginBottom:4}}><span style={{color:C.gray3,minWidth:110}}>{l}:</span><span style={{color:C.gray1}}>{v}</span></div>)}
          <div style={{marginTop:10,padding:"8px 12px",background:C.bgCard,borderRadius:8,border:`1px solid ${C.green}33`}}>
            <div style={{fontSize:13,color:C.green,fontWeight:600,marginBottom:2}}>Melhor abordagem</div>
            <div style={{fontSize:14,color:C.gray1}}>{p.bestApproach}</div>
          </div>
          <div style={{marginTop:6,padding:"8px 12px",background:C.bgCard,borderRadius:8,border:"1px solid #D9445233"}}>
            <div style={{fontSize:13,color:"#D94452",fontWeight:600,marginBottom:2}}>Risco</div>
            <div style={{fontSize:14,color:C.gray1}}>{p.risk}</div>
          </div>
        </div>
        <button onClick={()=>setExpanded(!expanded)} style={{background:"none",border:"none",color:C.green,fontSize:13,cursor:"pointer",marginBottom:12,fontFamily:Font}}>
          {expanded?"▲ Recolher detalhes":"▼ Ver detalhes completos"}
        </button>
        {expanded&&<div style={{background:C.bgInput,borderRadius:12,padding:"16px 20px",border:`1px solid ${C.border}`,marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:600,color:C.green,textTransform:"uppercase",marginBottom:6}}>Como tende a funcionar</div>
          {[`Sob pressão: ${p.pressao}`,`Processos: ${p.processos}`,`Convívio: ${p.convivio}`,`Feedback: ${p.feedbackRecepcao}`].map((t,i)=><div key={i} style={{fontSize:14,color:C.gray1,marginBottom:3,lineHeight:1.5}}>{t}</div>)}
          {behavior&&<><div style={{fontSize:13,fontWeight:600,color:C.green,textTransform:"uppercase",marginBottom:6,marginTop:12}}>Contexto do funcionário</div>
            <div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Comportamento: {behavior}</div>
            <div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Comprometimento: {commitment}</div>
            <div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Performance: {performance}</div>
            <div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Relacionamento: {relationship}</div>
          </>}
          {(p.openStrength||p.openChallenge)&&<><div style={{fontSize:13,fontWeight:600,color:C.green,textTransform:"uppercase",marginBottom:6,marginTop:12}}>Observações</div>
            {p.openStrength&&<div style={{fontSize:14,color:C.gray1,marginBottom:3}}><strong>Faz bem:</strong> {p.openStrength}</div>}
            {p.openChallenge&&<div style={{fontSize:14,color:C.gray1,marginBottom:3}}><strong>Dificuldade:</strong> {p.openChallenge}</div>}
          </>}
          {!wantsStory&&facts&&<><div style={{fontSize:13,fontWeight:600,color:C.green,textTransform:"uppercase",marginBottom:6,marginTop:12}}>Situação</div>
            <div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Fatos: {facts}</div>
            {causes&&<div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Causas: {causes}</div>}
            {frequency&&<div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Frequência: {frequency}</div>}
            {riskLevel&&<div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Risco: {riskLevel}</div>}
            {emotion&&<div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Emoção: {emotion}</div>}
            {intentSelf&&<div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Intenção (eu): {intentSelf}</div>}
            {intentPerson&&<div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Intenção (pessoa): {intentPerson}</div>}
            {intentTeam&&<div style={{fontSize:14,color:C.gray1,marginBottom:3}}>Intenção (time): {intentTeam}</div>}
          </>}
        </div>}
        <div style={{display:"flex",gap:10,marginTop:16}}>
          <button onClick={()=>setStep(wantsStory?"choice":"emotion")} style={bg}>Voltar</button>
          <button onClick={handleConfirm} style={bp(false)}>Iniciar Treinamento →</button>
        </div>
      </div>
    </div>);
  }
  return null;
}
ENDOFFILE
wc -l /home/claude/PA3.jsx
