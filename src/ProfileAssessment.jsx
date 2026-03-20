// ============================================================
// PROFILE ASSESSMENT MODULE v2
// Fluxo: Dados básicos → Situação → Questionário → Resultado
// ============================================================
import { useState } from "react";

const QUESTIONS = [
  // BLOCO 1 — SUPERFÍCIE OBSERVÁVEL
  {
    block: "Superfície Observável",
    title: "No dia a dia, essa pessoa tende a se comunicar de que forma?",
    maxSelect: 2,
    options: [
      { id: "1a", text: "Vai mais direto ao ponto e costuma falar de forma objetiva", disc: "D" },
      { id: "1b", text: "Costuma envolver os outros com entusiasmo, conversa e persuasão", disc: "I" },
      { id: "1c", text: "Fala de forma calma, cuidadosa e sem pressa", disc: "S" },
      { id: "1d", text: "Costuma se expressar com lógica, detalhes e atenção ao que está correto", disc: "C" },
    ],
  },
  {
    block: "Superfície Observável",
    title: "Quando precisa agir no trabalho, essa pessoa tende a:",
    maxSelect: 2,
    options: [
      { id: "2a", text: "Agir rápido e assumir a frente", disc: "D" },
      { id: "2b", text: "Mobilizar pessoas e criar entusiasmo", disc: "I" },
      { id: "2c", text: "Manter constância e evitar rupturas", disc: "S" },
      { id: "2d", text: "Conferir critérios antes de avançar", disc: "C" },
    ],
  },
  {
    block: "Superfície Observável",
    title: "Como essa pessoa costuma tomar decisões?",
    maxSelect: 2,
    options: [
      { id: "3a", text: "Decide rapidamente e ajusta depois", func: "decisão rápida" },
      { id: "3b", text: "Decide considerando o impacto sobre as pessoas e o clima", func: "decisão relacional" },
      { id: "3c", text: "Decide com cautela, buscando segurança", func: "decisão prudente" },
      { id: "3d", text: "Decide com base em lógica, dados e coerência", func: "decisão lógica/analítica" },
    ],
  },
  {
    block: "Superfície Observável",
    title: "Essa pessoa tende a:",
    maxSelect: 2,
    options: [
      { id: "4a", text: "Trabalhar com rapidez e senso de urgência", func: "ritmo rápido" },
      { id: "4b", text: "Alternar a intensidade conforme o estímulo, as pessoas e a situação", func: "ritmo variável/social" },
      { id: "4c", text: "Manter um ritmo estável e previsível", func: "ritmo estável" },
      { id: "4d", text: "Trabalhar com atenção, revisão e precisão", func: "ritmo cuidadoso" },
    ],
  },
  // BLOCO 2 — FUNCIONAMENTO PRÁTICO
  {
    block: "Funcionamento Prático",
    title: "Quando aparecem mudanças, essa pessoa:",
    maxSelect: 2,
    options: [
      { id: "5a", text: "Costuma aceitar quando enxerga um ganho claro", func: "abertura condicional/pragmática" },
      { id: "5b", text: "Costuma gostar quando a mudança traz novidade e movimento", func: "abertura alta" },
      { id: "5c", text: "Prefere ter tempo para se adaptar", func: "abertura baixa ou moderada" },
      { id: "5d", text: "Costuma questionar bastante antes de aderir", func: "abertura baixa/analítica" },
    ],
  },
  {
    block: "Funcionamento Prático",
    title: "Sob pressão, essa pessoa tende a:",
    maxSelect: 2,
    options: [
      { id: "6a", text: "Endurecer, cobrar mais ou querer resolver logo", func: "pressão dominante" },
      { id: "6b", text: "Falar mais, se justificar ou tentar sustentar a energia do ambiente", func: "pressão expansiva" },
      { id: "6c", text: "Se retrair, absorver ou evitar conflito", func: "pressão sensível/recuo" },
      { id: "6d", text: "Se defender com argumentos, lógica ou muitos detalhes", func: "defesa racional" },
    ],
  },
  {
    block: "Funcionamento Prático",
    title: "Em relação a processos e regras, essa pessoa tende a:",
    maxSelect: 2,
    options: [
      { id: "7a", text: "Seguir quando enxerga utilidade prática", func: "adesão pragmática" },
      { id: "7b", text: "Flexibilizar quando acha que atrapalha", func: "risco de atalhos" },
      { id: "7c", text: "Gostar de clareza e previsibilidade", func: "busca por segurança/constância" },
      { id: "7d", text: "Valorizar padrão, critério e consistência", func: "alta valorização de processo" },
    ],
  },
  {
    block: "Funcionamento Prático",
    title: "No convívio com colegas e liderança, essa pessoa:",
    maxSelect: 2,
    options: [
      { id: "8a", text: "Costuma se posicionar com firmeza, mesmo que isso gere atrito", func: "assertividade alta / risco de atrito" },
      { id: "8b", text: "Costuma influenciar os outros pelo entusiasmo e pela fala", func: "influência social" },
      { id: "8c", text: "Costuma cooperar e buscar harmonia", func: "cooperação alta" },
      { id: "8d", text: "Costuma ser mais reservada e manter seu próprio critério", func: "reserva / independência" },
    ],
  },
  {
    block: "Funcionamento Prático",
    title: "Quando recebe feedback, essa pessoa tende a:",
    maxSelect: 2,
    options: [
      { id: "9a", text: "Escutar, mas reagir se achar injusto", func: "defesa por senso de justiça" },
      { id: "9b", text: "Precisar sentir reconhecimento antes do ajuste", func: "sensibilidade a reconhecimento" },
      { id: "9c", text: "Aceitar melhor quando há segurança e respeito", func: "receptividade relacional" },
      { id: "9d", text: "Aceitar melhor quando há fatos, lógica e clareza", func: "receptividade factual" },
    ],
  },
  // BLOCO 3 — MOTIVADORES
  {
    block: "Motivadores",
    title: "No dia a dia, essa pessoa parece mais movida por:",
    maxSelect: 3,
    options: [
      { id: "10a", text: "Resultado e metas", func: "resultado" },
      { id: "10b", text: "Reconhecimento e visibilidade", func: "reconhecimento" },
      { id: "10c", text: "Segurança e previsibilidade", func: "segurança" },
      { id: "10d", text: "Autonomia para fazer do próprio jeito", func: "autonomia" },
      { id: "10e", text: "Pertencimento e boa convivência", func: "pertencimento" },
      { id: "10f", text: "Crescimento e aprendizado", func: "crescimento" },
    ],
  },
];

const DISC_DESC = {
  D: "tende a ser objetivo, firme e orientado a resultado",
  I: "tende a ser comunicativo, persuasivo e voltado à interação",
  S: "tende a ser calmo, constante e colaborativo",
  C: "tende a ser lógico, criterioso e orientado a qualidade",
  DI: "tende a ser objetivo, persuasivo e orientado à ação",
  ID: "tende a ser comunicativo, enérgico e rápido para agir",
  DC: "tende a ser objetivo, lógico e orientado a resultado",
  CD: "tende a ser criterioso, analítico e firme ao se posicionar",
  DS: "tende a ser firme, estável e orientado a conduzir com constância",
  SD: "tende a ser constante, firme e confiável na execução",
  IS: "tende a ser comunicativo, acolhedor e agregador",
  SI: "tende a ser colaborativo, estável e gentil na interação",
  IC: "tende a ser comunicativo, observador e atento à forma de se expressar",
  CI: "tende a ser lógico, reservado e cuidadoso na comunicação",
  SC: "tende a ser calmo, organizado e atento à qualidade",
  CS: "tende a ser criterioso, estável e cuidadoso na execução",
};

const calculateProfile = (answers, openAnswers) => {
  const discScores = { D: 0, I: 0, S: 0, C: 0 };
  [0, 1].forEach((qi) => {
    (answers[qi] || []).forEach((optId) => {
      const opt = QUESTIONS[qi].options.find((o) => o.id === optId);
      if (opt?.disc) discScores[opt.disc]++;
    });
  });
  const sorted = Object.entries(discScores).sort((a, b) => b[1] - a[1]);
  let discPrimary = sorted[0][0];
  let discSecondary = sorted[1][1] > 0 ? sorted[1][0] : null;
  let discCode = discSecondary && sorted[1][1] >= sorted[0][1] * 0.5 ? discPrimary + discSecondary : discPrimary;
  let discDescription = DISC_DESC[discCode] || DISC_DESC[discPrimary];

  const funcMap = { 2: "decisao", 3: "ritmo", 4: "mudancas", 5: "pressao", 6: "processos", 7: "convivio", 8: "feedback_recepcao" };
  const funcFields = {};
  Object.entries(funcMap).forEach(([qi, field]) => {
    const vals = (answers[parseInt(qi)] || []).map((optId) => {
      const opt = QUESTIONS[parseInt(qi)].options.find((o) => o.id === optId);
      return opt?.func || "";
    }).filter(Boolean);
    funcFields[field] = vals.join(" / ") || "não identificado";
  });

  const motivators = (answers[9] || []).map((optId) => {
    const opt = QUESTIONS[9].options.find((o) => o.id === optId);
    return opt?.func || "";
  }).filter(Boolean);

  let bestApproach = "clara e respeitosa";
  let risk = "manter acompanhamento para sustentação da mudança";
  if (discPrimary === "D") { bestApproach = "direta, objetiva e focada em resultado"; risk = "pode reagir se sentir que está sendo controlado ou injustiçado"; }
  else if (discPrimary === "I") { bestApproach = "com reconhecimento primeiro, depois o ajuste, em tom leve"; risk = "pode concordar no momento e não manter a mudança"; }
  else if (discPrimary === "S") { bestApproach = "em ambiente seguro, com respeito e sem pressão"; risk = "pode aceitar sem discordar, mas absorver emocionalmente"; }
  else if (discPrimary === "C") { bestApproach = "com fatos, dados e lógica clara"; risk = "pode se defender com argumentos e questionar a validade do feedback"; }

  const comunicacao = (answers[0] || []).map((optId) => {
    const opt = QUESTIONS[0].options.find((o) => o.id === optId);
    return opt?.text?.toLowerCase() || "";
  }).join(" e ") || "não identificada";

  return { discCode, discDescription, comunicacao, ritmo: funcFields.ritmo, decisao: funcFields.decisao, mudancas: funcFields.mudancas, pressao: funcFields.pressao, processos: funcFields.processos, convivio: funcFields.convivio, feedbackRecepcao: funcFields.feedback_recepcao, motivators, bestApproach, risk, openStrength: openAnswers.strength || "", openChallenge: openAnswers.challenge || "" };
};

const profileToText = (p) => {
  let t = `Estilo predominante: ${p.discCode} — ${p.discDescription}\n`;
  t += `Comunicação: ${p.comunicacao}\nRitmo: ${p.ritmo}\nDecisão: ${p.decisao}\nMudanças: ${p.mudancas}\n`;
  t += `Sob pressão: ${p.pressao}\nProcessos: ${p.processos}\nConvívio: ${p.convivio}\n`;
  t += `Recepção a feedback: ${p.feedbackRecepcao}\nMotivadores: ${p.motivators.join(", ")}\n`;
  t += `Melhor abordagem: ${p.bestApproach}\nRisco: ${p.risk}\n`;
  if (p.openStrength) t += `Ponto forte: ${p.openStrength}\n`;
  if (p.openChallenge) t += `Ponto de atenção: ${p.openChallenge}\n`;
  return t;
};

export { QUESTIONS, calculateProfile, profileToText };

// ============================================================
// STEP CONSTANTS
// ============================================================
const STEP_BASIC = "basic";        // Nome, idade, cargo
const STEP_SITUATION = "situation"; // Descrever a situação
const STEP_QUESTIONS = "questions"; // Questionário DISC
const STEP_OPEN = "open";          // Perguntas abertas
const STEP_RESULT = "result";      // Card de resultado

export default function ProfileAssessment({ colors: C, onComplete, onCancel, Font }) {
  const [step, setStep] = useState(STEP_BASIC);
  const [targetAge, setTargetAge] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetName, setTargetName] = useState("");
  const [situation, setSituation] = useState("");
  const [wantsStory, setWantsStory] = useState(null); // true=história, false=situação real, null=não escolheu
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [openAnswers, setOpenAnswers] = useState({ strength: "", challenge: "" });
  const [openStep, setOpenStep] = useState(0); // 0=strength, 1=challenge
  const [resultProfile, setResultProfile] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const totalSteps = QUESTIONS.length + 5; // basic + situation + questions + 2 open + result
  const getProgress = () => {
    if (step === STEP_BASIC) return 5;
    if (step === STEP_SITUATION) return 12;
    if (step === STEP_QUESTIONS) return 15 + (currentQ / QUESTIONS.length) * 60;
    if (step === STEP_OPEN) return 80 + openStep * 8;
    return 100;
  };

  const toggleOption = (qIndex, optId) => {
    const maxSel = QUESTIONS[qIndex].maxSelect;
    setAnswers((prev) => {
      const current = prev[qIndex] || [];
      if (current.includes(optId)) return { ...prev, [qIndex]: current.filter((id) => id !== optId) };
      if (current.length >= maxSel) return prev;
      return { ...prev, [qIndex]: [...current, optId] };
    });
  };
  const isSelected = (qIndex, optId) => (answers[qIndex] || []).includes(optId);
  const hasAnswer = (qIndex) => (answers[qIndex] || []).length > 0;

  const handleFinish = () => {
    const profile = calculateProfile(answers, openAnswers);
    setResultProfile(profile);
    setStep(STEP_RESULT);
  };

  const handleConfirm = () => {
    if (onComplete) {
      onComplete({
        age: targetAge, role: targetRole, name: targetName,
        personality: profileToText(resultProfile), profileData: resultProfile,
        situation: wantsStory ? "O usuário escolheu uma história criada pela IA." : situation,
        wantsStory,
      });
    }
  };

  // Shared styles
  const card = { background: C.bgCard, borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 600, border: `1px solid ${C.border}`, boxShadow: C.shadow, maxHeight: "85vh", overflowY: "auto" };
  const progressBar = <div style={{ height: 4, background: C.border, borderRadius: 4, marginBottom: 24 }}><div style={{ height: 4, background: C.green, borderRadius: 4, width: `${getProgress()}%`, transition: "width 0.3s" }} /></div>;
  const btnPrimary = (disabled) => ({ flex: 1, padding: "12px 22px", borderRadius: 10, border: "none", background: disabled ? C.gray4 : `linear-gradient(135deg,${C.green},${C.greenBright})`, color: C.white, fontSize: 15, fontWeight: 600, fontFamily: Font, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, boxShadow: "0 4px 16px rgba(45,139,78,0.25)" });
  const btnGhost = { padding: "12px 22px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.gray2, fontSize: 15, fontFamily: Font, cursor: "pointer" };
  const inputStyle = { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgInput, color: C.white, fontSize: 16, fontFamily: Font, outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 14, fontWeight: 500, color: C.gray2, marginBottom: 6 };
  const optBtn = (sel) => ({ width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${sel ? C.green : C.border}`, background: sel ? C.bgInput : "transparent", color: sel ? C.white : C.gray2, fontSize: 15, fontFamily: Font, cursor: "pointer", textAlign: "left", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 });
  const checkBox = (sel) => ({ width: 20, height: 20, borderRadius: 5, border: `2px solid ${sel ? C.green : C.gray4}`, background: sel ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" });
  const checkSvg = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;
  const heading = (text) => <h2 style={{ fontFamily: `'Playfair Display',Georgia,serif`, fontSize: 22, marginBottom: 6 }}>{text}</h2>;
  const subtitle = (text) => <p style={{ fontSize: 14, color: C.gray3, marginBottom: 20 }}>{text}</p>;
  const fieldGroup = (label, child) => <div style={{ marginBottom: 16 }}><label style={labelStyle}>{label}</label>{child}</div>;

  // ============================================================
  // STEP: BASIC INFO
  // ============================================================
  if (step === STEP_BASIC) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={card} className="fade-in">
        {progressBar}
        {heading("Pessoa que irá receber o feedback")}
        {subtitle("Preencha os dados básicos de quem vai receber o feedback.")}
        {fieldGroup("Nome (opcional)", <input type="text" placeholder="Ex: João" value={targetName} onChange={(e) => setTargetName(e.target.value)} style={inputStyle} />)}
        {fieldGroup("Idade", <input type="number" placeholder="Ex: 28" value={targetAge} onChange={(e) => setTargetAge(e.target.value)} style={inputStyle} />)}
        {fieldGroup("Cargo", <input type="text" placeholder="Ex: Consultor de Vendas" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} style={inputStyle} />)}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onCancel} style={btnGhost}>Cancelar</button>
          <button onClick={() => setStep(STEP_SITUATION)} disabled={!targetAge || !targetRole} style={btnPrimary(!targetAge || !targetRole)}>Continuar →</button>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // STEP: SITUATION
  // ============================================================
  if (step === STEP_SITUATION) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={card} className="fade-in">
        {progressBar}
        {heading("Contexto do feedback")}
        {subtitle("Escolha como deseja começar o treinamento.")}

        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <button onClick={() => setWantsStory(false)} style={{ ...optBtn(wantsStory === false), flex: 1, justifyContent: "center", fontWeight: 600 }}>
            Tenho uma situação real
          </button>
          <button onClick={() => setWantsStory(true)} style={{ ...optBtn(wantsStory === true), flex: 1, justifyContent: "center", fontWeight: 600 }}>
            Quero uma história
          </button>
        </div>

        {wantsStory === false && <>
          <p style={{ fontSize: 14, color: C.gray1, marginBottom: 8, lineHeight: 1.6 }}>
            Descreva o que aconteceu de forma objetiva — <strong style={{ color: C.green }}>fatos e ações observáveis</strong>, sem julgamentos ou interpretações emocionais.
          </p>
          <p style={{ fontSize: 13, color: C.gray3, marginBottom: 14, lineHeight: 1.5 }}>
            Exemplo: "Na reunião de segunda, ele interrompeu o colega 3 vezes durante a apresentação."
            <br />Em vez de: "Ele foi grosso e desrespeitoso na reunião."
          </p>
          <textarea value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="Descreva o que aconteceu, quando, quem estava envolvido e qual foi o impacto concreto..." style={{ ...inputStyle, minHeight: 120, resize: "vertical", lineHeight: 1.5 }} />
          {situation.length > 0 && situation.length < 30 && <p style={{ fontSize: 12, color: C.gray4, marginTop: 4 }}>Descreva com mais detalhes (mínimo 30 caracteres)</p>}
        </>}

        {wantsStory === true && <div style={{ background: C.bgInput, borderRadius: 10, padding: "14px 16px", border: `1px solid ${C.green}33` }}>
          <p style={{ fontSize: 14, color: C.gray1, lineHeight: 1.6 }}>A IA vai criar uma história personalizada com base no perfil que você construir nas próximas etapas. Você poderá fazer escolhas ao longo da narrativa.</p>
        </div>}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={() => setStep(STEP_BASIC)} style={btnGhost}>Voltar</button>
          <button onClick={() => { setCurrentQ(0); setStep(STEP_QUESTIONS); }} disabled={wantsStory === null || (wantsStory === false && situation.length < 30)} style={btnPrimary(wantsStory === null || (wantsStory === false && situation.length < 30))}>Continuar →</button>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // STEP: QUESTIONS
  // ============================================================
  if (step === STEP_QUESTIONS) {
    const q = QUESTIONS[currentQ];
    const currentBlock = q.block;
    const prevBlock = currentQ > 0 ? QUESTIONS[currentQ - 1].block : "";
    const showBlockTitle = currentBlock !== prevBlock;
    const isMotivators = q.maxSelect === 3;

    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
        <div style={card} className="fade-in">
          {progressBar}
          {showBlockTitle && <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{currentBlock}</div>}
          <h3 style={{ fontFamily: `'Playfair Display',Georgia,serif`, fontSize: 20, marginBottom: 6 }}>{q.title}</h3>
          <p style={{ fontSize: 13, color: C.gray3, marginBottom: 16 }}>
            {isMotivators ? "Marque até 3 opções que mais combinam com a pessoa." : "Marque até 2 opções. Se ficar em dúvida, escolha o que aparece com mais frequência no trabalho."}
          </p>
          <div>
            {q.options.map((opt) => {
              const sel = isSelected(currentQ, opt.id);
              return (
                <button key={opt.id} onClick={() => toggleOption(currentQ, opt.id)} style={optBtn(sel)}>
                  <div style={checkBox(sel)}>{sel && checkSvg}</div>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => { if (currentQ > 0) setCurrentQ(q => q - 1); else setStep(STEP_SITUATION); }} style={btnGhost}>Voltar</button>
            <button onClick={() => { if (currentQ < QUESTIONS.length - 1) setCurrentQ(q => q + 1); else { setOpenStep(0); setStep(STEP_OPEN); } }} disabled={!hasAnswer(currentQ)} style={btnPrimary(!hasAnswer(currentQ))}>Continuar →</button>
          </div>
          <div style={{ fontSize: 12, color: C.gray4, marginTop: 12, textAlign: "center" }}>Pergunta {currentQ + 1} de {QUESTIONS.length}</div>
        </div>
      </div>
    );
  }

  // ============================================================
  // STEP: OPEN QUESTIONS
  // ============================================================
  if (step === STEP_OPEN) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={card} className="fade-in">
        {progressBar}
        {openStep === 0 ? <>
          {heading("Ponto forte")}
          {subtitle("O que essa pessoa faz muito bem no trabalho?")}
          <textarea value={openAnswers.strength} onChange={(e) => setOpenAnswers((p) => ({ ...p, strength: e.target.value }))} placeholder="Descreva livremente..." style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.5 }} />
        </> : <>
          {heading("Ponto de atenção")}
          {subtitle("O que mais costuma dificultar o desempenho, a convivência ou a evolução dessa pessoa?")}
          <textarea value={openAnswers.challenge} onChange={(e) => setOpenAnswers((p) => ({ ...p, challenge: e.target.value }))} placeholder="Descreva livremente..." style={{ ...inputStyle, minHeight: 100, resize: "vertical", lineHeight: 1.5 }} />
        </>}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={() => { if (openStep > 0) setOpenStep(0); else { setCurrentQ(QUESTIONS.length - 1); setStep(STEP_QUESTIONS); } }} style={btnGhost}>Voltar</button>
          {openStep === 0 ? (
            <button onClick={() => setOpenStep(1)} style={btnPrimary(false)}>{openAnswers.strength ? "Continuar →" : "Pular →"}</button>
          ) : (
            <button onClick={handleFinish} style={btnPrimary(false)}>Ver perfil →</button>
          )}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // STEP: RESULT
  // ============================================================
  if (step === STEP_RESULT && resultProfile) {
    const p = resultProfile;
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
        <div style={card} className="fade-in">
          {heading("Perfil Identificado")}
          {subtitle(`${targetName ? targetName + " — " : ""}${targetRole}, ${targetAge} anos`)}

          <div style={{ background: C.bgInput, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.green, textTransform: "uppercase", letterSpacing: "0.06em" }}>Estilo predominante</span>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.white, marginTop: 2 }}>{p.discCode} — <span style={{ fontWeight: 400, color: C.gray1 }}>{p.discDescription}</span></div>
            </div>
            {[["Comunicação", p.comunicacao], ["Ritmo", p.ritmo], ["Decisão", p.decisao], ["Mudanças", p.mudancas], ["Motivadores", p.motivators.join(", ")]].map(([label, val], i) => (
              <div key={i} style={{ display: "flex", fontSize: 14, marginBottom: 4 }}>
                <span style={{ color: C.gray3, minWidth: 110 }}>{label}:</span>
                <span style={{ color: C.gray1 }}>{val}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: "8px 12px", background: C.bgCard, borderRadius: 8, border: `1px solid ${C.green}33` }}>
              <div style={{ fontSize: 13, color: C.green, fontWeight: 600, marginBottom: 2 }}>Melhor abordagem</div>
              <div style={{ fontSize: 14, color: C.gray1 }}>{p.bestApproach}</div>
            </div>
            <div style={{ marginTop: 6, padding: "8px 12px", background: C.bgCard, borderRadius: 8, border: `1px solid #D9445233` }}>
              <div style={{ fontSize: 13, color: "#D94452", fontWeight: 600, marginBottom: 2 }}>Risco</div>
              <div style={{ fontSize: 14, color: C.gray1 }}>{p.risk}</div>
            </div>
          </div>

          <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", color: C.green, fontSize: 13, cursor: "pointer", marginBottom: 12, fontFamily: Font }}>
            {expanded ? "▲ Recolher detalhes" : "▼ Ver detalhes completos"}
          </button>

          {expanded && (
            <div style={{ background: C.bgInput, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.green, textTransform: "uppercase", marginBottom: 6 }}>Como tende a funcionar</div>
              {[`Sob pressão: ${p.pressao}`, `Processos: ${p.processos}`, `Convívio: ${p.convivio}`, `Feedback: ${p.feedbackRecepcao}`].map((item, i) => <div key={i} style={{ fontSize: 14, color: C.gray1, marginBottom: 3, lineHeight: 1.5 }}>{item}</div>)}
              {(p.openStrength || p.openChallenge) && <>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.green, textTransform: "uppercase", marginBottom: 6, marginTop: 12 }}>Observações</div>
                {p.openStrength && <div style={{ fontSize: 14, color: C.gray1, marginBottom: 3 }}><strong>Faz bem:</strong> {p.openStrength}</div>}
                {p.openChallenge && <div style={{ fontSize: 14, color: C.gray1, marginBottom: 3 }}><strong>Dificuldade:</strong> {p.openChallenge}</div>}
              </>}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => { setStep(STEP_OPEN); setOpenStep(1); }} style={btnGhost}>Voltar</button>
            <button onClick={handleConfirm} style={btnPrimary(false)}>Iniciar Treinamento →</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
