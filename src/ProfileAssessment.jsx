// ============================================================
// PROFILE ASSESSMENT MODULE - Questionário de Perfil do Receptor
// ============================================================
import { useState } from "react";

// DISC + Functional mappings
const QUESTIONS = [
  // BLOCO 1 — SUPERFÍCIE OBSERVÁVEL
  {
    block: "Superfície Observável",
    title: "Como essa pessoa costuma se comunicar?",
    maxSelect: 2,
    options: [
      { id: "1a", text: "Direta e objetiva", disc: "D" },
      { id: "1b", text: "Persuasiva e expansiva", disc: "I" },
      { id: "1c", text: "Calma e cuidadosa", disc: "S" },
      { id: "1d", text: "Analítica e detalhista", disc: "C" },
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
    title: "Em relação ao ritmo de trabalho, essa pessoa tende a:",
    maxSelect: 2,
    options: [
      { id: "4a", text: "Trabalhar com rapidez e senso de urgência", func: "ritmo rápido" },
      { id: "4b", text: "Alternar intensidade conforme interação e estímulo", func: "ritmo variável/social" },
      { id: "4c", text: "Manter ritmo estável e previsível", func: "ritmo estável" },
      { id: "4d", text: "Trabalhar com atenção, revisão e precisão", func: "ritmo cuidadoso" },
    ],
  },
  // BLOCO 2 — FUNCIONAMENTO PRÁTICO
  {
    block: "Funcionamento Prático",
    title: "Como essa pessoa costuma reagir a mudanças?",
    maxSelect: 2,
    options: [
      { id: "5a", text: "Aceita quando enxerga ganho claro", func: "abertura condicional/pragmática" },
      { id: "5b", text: "Gosta quando a mudança traz novidade e movimento", func: "abertura alta" },
      { id: "5c", text: "Prefere tempo para se adaptar", func: "abertura baixa ou moderada" },
      { id: "5d", text: "Questiona bastante antes de aderir", func: "abertura baixa/analítica" },
    ],
  },
  {
    block: "Funcionamento Prático",
    title: "Sob pressão, essa pessoa tende a:",
    maxSelect: 2,
    options: [
      { id: "6a", text: "Endurecer, cobrar ou querer resolver logo", func: "pressão dominante" },
      { id: "6b", text: "Falar mais, justificar ou tentar manter a energia", func: "pressão expansiva" },
      { id: "6c", text: "Se retrair, absorver ou evitar conflito", func: "pressão sensível/recuo" },
      { id: "6d", text: "Se defender com argumentos, lógica ou detalhes", func: "defesa racional" },
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
    title: "No convívio com colegas e liderança, essa pessoa tende a:",
    maxSelect: 2,
    options: [
      { id: "8a", text: "Se posicionar com firmeza mesmo se gerar atrito", func: "assertividade alta / risco de atrito" },
      { id: "8b", text: "Influenciar pelo entusiasmo e pela fala", func: "influência social" },
      { id: "8c", text: "Cooperar e manter harmonia", func: "cooperação alta" },
      { id: "8d", text: "Ser mais reservada e manter critério próprio", func: "reserva / independência" },
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

// DISC descriptions
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

// ============================================================
// SCORING LOGIC
// ============================================================
const calculateProfile = (answers, openAnswers) => {
  // Step 1: DISC from questions 1-2
  const discScores = { D: 0, I: 0, S: 0, C: 0 };
  [0, 1].forEach((qi) => {
    const selected = answers[qi] || [];
    selected.forEach((optId) => {
      const opt = QUESTIONS[qi].options.find((o) => o.id === optId);
      if (opt?.disc) discScores[opt.disc]++;
    });
  });

  const sorted = Object.entries(discScores).sort((a, b) => b[1] - a[1]);
  let discPrimary = sorted[0][0];
  let discSecondary = sorted[1][1] > 0 ? sorted[1][0] : null;
  let discCode = discSecondary && sorted[1][1] >= sorted[0][1] * 0.5 ? discPrimary + discSecondary : discPrimary;
  let discDescription = DISC_DESC[discCode] || DISC_DESC[discPrimary];

  // Step 2: Functional fields from questions 3-9
  const funcFields = {};
  const funcMap = {
    2: "decisao", 3: "ritmo", 4: "mudancas", 5: "pressao", 6: "processos", 7: "convivio", 8: "feedback_recepcao",
  };

  Object.entries(funcMap).forEach(([qi, field]) => {
    const selected = answers[parseInt(qi)] || [];
    const vals = selected.map((optId) => {
      const opt = QUESTIONS[parseInt(qi)].options.find((o) => o.id === optId);
      return opt?.func || "";
    }).filter(Boolean);
    funcFields[field] = vals.join(" / ") || "não identificado";
  });

  // Step 3: Motivators from question 10
  const motivators = (answers[9] || []).map((optId) => {
    const opt = QUESTIONS[9].options.find((o) => o.id === optId);
    return opt?.func || "";
  }).filter(Boolean);

  // Step 4: Derive best approach and risk
  let bestApproach = "clara e respeitosa";
  let risk = "manter acompanhamento para sustentação da mudança";

  if (discPrimary === "D") {
    bestApproach = "direta, objetiva e focada em resultado";
    risk = "pode reagir se sentir que está sendo controlado ou injustiçado";
  } else if (discPrimary === "I") {
    bestApproach = "com reconhecimento primeiro, depois o ajuste, em tom leve";
    risk = "pode concordar no momento e não manter a mudança";
  } else if (discPrimary === "S") {
    bestApproach = "em ambiente seguro, com respeito e sem pressão";
    risk = "pode aceitar sem discordar, mas absorver emocionalmente";
  } else if (discPrimary === "C") {
    bestApproach = "com fatos, dados e lógica clara";
    risk = "pode se defender com argumentos e questionar a validade do feedback";
  }

  // Step 5: Communication style
  const commSelected = answers[0] || [];
  let comunicacao = commSelected.map((optId) => {
    const opt = QUESTIONS[0].options.find((o) => o.id === optId);
    return opt?.text?.toLowerCase() || "";
  }).join(" e ") || "não identificada";

  return {
    discCode,
    discDescription,
    comunicacao,
    ritmo: funcFields.ritmo,
    decisao: funcFields.decisao,
    mudancas: funcFields.mudancas,
    pressao: funcFields.pressao,
    processos: funcFields.processos,
    convivio: funcFields.convivio,
    feedbackRecepcao: funcFields.feedback_recepcao,
    motivators,
    bestApproach,
    risk,
    openStrength: openAnswers.strength || "",
    openChallenge: openAnswers.challenge || "",
  };
};

// Generate text summary for the prompt
const profileToText = (p) => {
  let text = `Estilo predominante: ${p.discCode} — ${p.discDescription}\n`;
  text += `Comunicação: ${p.comunicacao}\n`;
  text += `Ritmo: ${p.ritmo}\n`;
  text += `Decisão: ${p.decisao}\n`;
  text += `Mudanças: ${p.mudancas}\n`;
  text += `Sob pressão: ${p.pressao}\n`;
  text += `Processos: ${p.processos}\n`;
  text += `Convívio: ${p.convivio}\n`;
  text += `Recepção a feedback: ${p.feedbackRecepcao}\n`;
  text += `Motivadores: ${p.motivators.join(", ")}\n`;
  text += `Melhor abordagem: ${p.bestApproach}\n`;
  text += `Risco: ${p.risk}\n`;
  if (p.openStrength) text += `Ponto forte: ${p.openStrength}\n`;
  if (p.openChallenge) text += `Ponto de atenção: ${p.openChallenge}\n`;
  return text;
};

// ============================================================
// COMPONENTS
// ============================================================
export { QUESTIONS, calculateProfile, profileToText };

export default function ProfileAssessment({ colors: C, onComplete, onCancel, Font }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [openAnswers, setOpenAnswers] = useState({ strength: "", challenge: "" });
  const [showResult, setShowResult] = useState(false);
  const [resultProfile, setResultProfile] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [targetAge, setTargetAge] = useState("");
  const [targetRole, setTargetRole] = useState("");

  const totalQuestions = QUESTIONS.length;
  const progress = ((currentQ + 1) / (totalQuestions + 3)) * 100; // +3 for open questions and basic info

  const toggleOption = (qIndex, optId) => {
    const maxSel = QUESTIONS[qIndex].maxSelect;
    setAnswers((prev) => {
      const current = prev[qIndex] || [];
      if (current.includes(optId)) {
        return { ...prev, [qIndex]: current.filter((id) => id !== optId) };
      }
      if (current.length >= maxSel) return prev;
      return { ...prev, [qIndex]: [...current, optId] };
    });
  };

  const isSelected = (qIndex, optId) => (answers[qIndex] || []).includes(optId);
  const hasAnswer = (qIndex) => (answers[qIndex] || []).length > 0;

  const handleFinish = () => {
    const profile = calculateProfile(answers, openAnswers);
    setResultProfile(profile);
    setShowResult(true);
  };

  const handleConfirm = () => {
    if (onComplete) {
      onComplete({
        age: targetAge,
        role: targetRole,
        personality: profileToText(resultProfile),
        profileData: resultProfile,
      });
    }
  };

  // Styles
  const card = { background: C.bgCard, borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 600, border: `1px solid ${C.border}`, boxShadow: C.shadow, maxHeight: "85vh", overflowY: "auto" };
  const optBtn = (selected) => ({
    width: "100%", padding: "12px 16px", borderRadius: 10, border: `1.5px solid ${selected ? C.green : C.border}`,
    background: selected ? C.bgInput : "transparent", color: selected ? C.white : C.gray2,
    fontSize: 15, fontFamily: Font, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
    display: "flex", alignItems: "center", gap: 10, marginBottom: 6,
  });
  const checkBox = (selected) => ({
    width: 20, height: 20, borderRadius: 5, border: `2px solid ${selected ? C.green : C.gray4}`,
    background: selected ? C.green : "transparent", display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0, transition: "all 0.15s",
  });

  // ---- RESULT CARD ----
  if (showResult && resultProfile) {
    const p = resultProfile;
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
        <div style={card} className="fade-in">
          <h2 style={{ fontFamily: `'Playfair Display',Georgia,serif`, fontSize: 22, marginBottom: 4 }}>Perfil Identificado</h2>
          <p style={{ fontSize: 13, color: C.gray3, marginBottom: 20 }}>Revise o perfil antes de iniciar o treinamento.</p>

          {/* Card fechado */}
          <div style={{ background: C.bgInput, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.green, textTransform: "uppercase", letterSpacing: "0.06em" }}>Estilo predominante</span>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.white, marginTop: 2 }}>{p.discCode} — <span style={{ fontWeight: 400, color: C.gray1 }}>{p.discDescription}</span></div>
            </div>
            {[
              ["Comunicação", p.comunicacao], ["Ritmo", p.ritmo], ["Decisão", p.decisao],
              ["Mudanças", p.mudancas], ["Motivadores", p.motivators.join(", ")],
            ].map(([label, val], i) => (
              <div key={i} style={{ display: "flex", fontSize: 14, marginBottom: 4 }}>
                <span style={{ color: C.gray3, minWidth: 110 }}>{label}:</span>
                <span style={{ color: C.gray1 }}>{val}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, padding: "8px 12px", background: C.bgCard, borderRadius: 8, border: `1px solid ${C.green}33` }}>
              <div style={{ fontSize: 13, color: C.green, fontWeight: 600, marginBottom: 2 }}>Melhor abordagem</div>
              <div style={{ fontSize: 14, color: C.gray1 }}>{p.bestApproach}</div>
            </div>
            <div style={{ marginTop: 6, padding: "8px 12px", background: C.bgCard, borderRadius: 8, border: `1px solid ${C.danger}33` }}>
              <div style={{ fontSize: 13, color: C.danger, fontWeight: 600, marginBottom: 2 }}>Risco</div>
              <div style={{ fontSize: 14, color: C.gray1 }}>{p.risk}</div>
            </div>
          </div>

          {/* Expandir */}
          <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", color: C.green, fontSize: 13, cursor: "pointer", marginBottom: 12, fontFamily: Font }}>
            {expanded ? "▲ Recolher detalhes" : "▼ Ver detalhes completos"}
          </button>

          {expanded && (
            <div style={{ background: C.bgInput, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
              {[
                { title: "Como tende a funcionar", items: [
                  `Sob pressão: ${p.pressao}`, `Processos: ${p.processos}`, `Convívio: ${p.convivio}`, `Feedback: ${p.feedbackRecepcao}`
                ]},
              ].map((section, si) => (
                <div key={si} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.green, textTransform: "uppercase", marginBottom: 6 }}>{section.title}</div>
                  {section.items.map((item, ii) => <div key={ii} style={{ fontSize: 14, color: C.gray1, marginBottom: 3, lineHeight: 1.5 }}>{item}</div>)}
                </div>
              ))}
              {(p.openStrength || p.openChallenge) && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.green, textTransform: "uppercase", marginBottom: 6 }}>Observações do avaliador</div>
                  {p.openStrength && <div style={{ fontSize: 14, color: C.gray1, marginBottom: 3 }}><strong>Faz bem:</strong> {p.openStrength}</div>}
                  {p.openChallenge && <div style={{ fontSize: 14, color: C.gray1, marginBottom: 3 }}><strong>Dificuldade:</strong> {p.openChallenge}</div>}
                </div>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => setShowResult(false)} style={{ padding: "12px 22px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.gray2, fontSize: 15, fontFamily: Font, cursor: "pointer" }}>Voltar</button>
            <button onClick={handleConfirm} disabled={!targetAge || !targetRole} style={{ flex: 1, padding: "12px 22px", borderRadius: 10, border: "none", background: (!targetAge || !targetRole) ? C.gray4 : `linear-gradient(135deg,${C.green},${C.greenBright})`, color: C.white, fontSize: 15, fontWeight: 600, fontFamily: Font, cursor: (!targetAge || !targetRole) ? "not-allowed" : "pointer", opacity: (!targetAge || !targetRole) ? 0.4 : 1, boxShadow: "0 4px 16px rgba(45,139,78,0.25)" }}>
              Iniciar Treinamento →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- BASIC INFO (first screen) ----
  if (currentQ === -1) {
    return null; // handled inline
  }

  // ---- OPEN QUESTIONS ----
  if (currentQ >= totalQuestions) {
    const openStep = currentQ - totalQuestions; // 0=strength, 1=challenge, 2=basic info
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
        <div style={card} className="fade-in">
          <div style={{ height: 4, background: C.border, borderRadius: 4, marginBottom: 24 }}>
            <div style={{ height: 4, background: C.green, borderRadius: 4, width: `${progress}%`, transition: "width 0.3s" }} />
          </div>

          {openStep === 0 && <>
            <h3 style={{ fontFamily: `'Playfair Display',Georgia,serif`, fontSize: 20, marginBottom: 4 }}>Ponto forte</h3>
            <p style={{ fontSize: 14, color: C.gray3, marginBottom: 16 }}>O que essa pessoa faz muito bem no trabalho?</p>
            <textarea value={openAnswers.strength} onChange={(e) => setOpenAnswers((p) => ({ ...p, strength: e.target.value }))} placeholder="Descreva livremente..." style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgInput, color: C.white, fontSize: 15, fontFamily: Font, outline: "none", resize: "vertical", minHeight: 100, lineHeight: 1.5, boxSizing: "border-box" }} />
          </>}

          {openStep === 1 && <>
            <h3 style={{ fontFamily: `'Playfair Display',Georgia,serif`, fontSize: 20, marginBottom: 4 }}>Ponto de atenção</h3>
            <p style={{ fontSize: 14, color: C.gray3, marginBottom: 16 }}>O que mais costuma dificultar o desempenho, a convivência ou a evolução dessa pessoa?</p>
            <textarea value={openAnswers.challenge} onChange={(e) => setOpenAnswers((p) => ({ ...p, challenge: e.target.value }))} placeholder="Descreva livremente..." style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgInput, color: C.white, fontSize: 15, fontFamily: Font, outline: "none", resize: "vertical", minHeight: 100, lineHeight: 1.5, boxSizing: "border-box" }} />
          </>}

          {openStep === 2 && <>
            <h3 style={{ fontFamily: `'Playfair Display',Georgia,serif`, fontSize: 20, marginBottom: 4 }}>Dados básicos do receptor</h3>
            <p style={{ fontSize: 14, color: C.gray3, marginBottom: 16 }}>Informações complementares para o treinamento.</p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: C.gray2, marginBottom: 6 }}>Idade</label>
              <input type="number" placeholder="Ex: 28" value={targetAge} onChange={(e) => setTargetAge(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgInput, color: C.white, fontSize: 16, fontFamily: Font, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: C.gray2, marginBottom: 6 }}>Cargo</label>
              <input type="text" placeholder="Ex: Consultor de Vendas" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.bgInput, color: C.white, fontSize: 16, fontFamily: Font, outline: "none", boxSizing: "border-box" }} />
            </div>
          </>}

          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            <button onClick={() => setCurrentQ((q) => q - 1)} style={{ padding: "12px 22px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.gray2, fontSize: 15, fontFamily: Font, cursor: "pointer" }}>Voltar</button>
            {openStep < 2 ? (
              <button onClick={() => setCurrentQ((q) => q + 1)} style={{ flex: 1, padding: "12px 22px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${C.green},${C.greenBright})`, color: C.white, fontSize: 15, fontWeight: 600, fontFamily: Font, cursor: "pointer", boxShadow: "0 4px 16px rgba(45,139,78,0.25)" }}>
                {openStep === 0 && !openAnswers.strength ? "Pular" : "Continuar"} →
              </button>
            ) : (
              <button onClick={handleFinish} disabled={!targetAge || !targetRole} style={{ flex: 1, padding: "12px 22px", borderRadius: 10, border: "none", background: (!targetAge || !targetRole) ? C.gray4 : `linear-gradient(135deg,${C.green},${C.greenBright})`, color: C.white, fontSize: 15, fontWeight: 600, fontFamily: Font, cursor: (!targetAge || !targetRole) ? "not-allowed" : "pointer", opacity: (!targetAge || !targetRole) ? 0.4 : 1, boxShadow: "0 4px 16px rgba(45,139,78,0.25)" }}>
                Ver perfil →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---- QUESTIONS ----
  const q = QUESTIONS[currentQ];
  const currentBlock = q.block;
  const prevBlock = currentQ > 0 ? QUESTIONS[currentQ - 1].block : "";
  const showBlockTitle = currentBlock !== prevBlock;

  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, overflowY: "auto" }}>
      <div style={card} className="fade-in">
        {/* Progress bar */}
        <div style={{ height: 4, background: C.border, borderRadius: 4, marginBottom: 20 }}>
          <div style={{ height: 4, background: C.green, borderRadius: 4, width: `${progress}%`, transition: "width 0.3s" }} />
        </div>

        {showBlockTitle && (
          <div style={{ fontSize: 11, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
            {currentBlock}
          </div>
        )}

        <h3 style={{ fontFamily: `'Playfair Display',Georgia,serif`, fontSize: 20, marginBottom: 6 }}>{q.title}</h3>
        <p style={{ fontSize: 13, color: C.gray3, marginBottom: 16 }}>
          Marque {q.maxSelect === 3 ? "até 3 opções" : "até 2 opções"} que mais combinam com a pessoa. Se ficar em dúvida, escolha o que aparece com mais frequência no trabalho.
        </p>

        <div>
          {q.options.map((opt) => {
            const sel = isSelected(currentQ, opt.id);
            return (
              <button key={opt.id} onClick={() => toggleOption(currentQ, opt.id)} style={optBtn(sel)}>
                <div style={checkBox(sel)}>
                  {sel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <span>{opt.text}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          {currentQ > 0 ? (
            <button onClick={() => setCurrentQ((q) => q - 1)} style={{ padding: "12px 22px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.gray2, fontSize: 15, fontFamily: Font, cursor: "pointer" }}>Voltar</button>
          ) : (
            <button onClick={onCancel} style={{ padding: "12px 22px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.gray2, fontSize: 15, fontFamily: Font, cursor: "pointer" }}>Cancelar</button>
          )}
          <button onClick={() => setCurrentQ((q) => q + 1)} disabled={!hasAnswer(currentQ)} style={{ flex: 1, padding: "12px 22px", borderRadius: 10, border: "none", background: !hasAnswer(currentQ) ? C.gray4 : `linear-gradient(135deg,${C.green},${C.greenBright})`, color: C.white, fontSize: 15, fontWeight: 600, fontFamily: Font, cursor: !hasAnswer(currentQ) ? "not-allowed" : "pointer", opacity: !hasAnswer(currentQ) ? 0.4 : 1, boxShadow: "0 4px 16px rgba(45,139,78,0.25)" }}>
            Continuar →
          </button>
        </div>

        <div style={{ fontSize: 12, color: C.gray4, marginTop: 12, textAlign: "center" }}>
          Pergunta {currentQ + 1} de {totalQuestions + 3}
        </div>
      </div>
    </div>
  );
}
