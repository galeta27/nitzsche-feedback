import { useState, useEffect } from "react";

export default function AdminDashboard({ supabase, colors: C, Font, onClose }) {
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ users: 0, conversations: 0, messages: 0, tokensInput: 0, tokensOutput: 0, feedbackPos: 0, feedbackNeg: 0 });
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [usageByUser, setUsageByUser] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll() }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // Load all profiles
      const profiles = await supabase._fetch("/rest/v1/profiles?select=*&order=created_at.desc", { method: "GET" });
      setUsers(Array.isArray(profiles) ? profiles : []);

      // Load conversations count
      const convs = await supabase._fetch("/rest/v1/conversations?select=id,user_id,title,created_at,total_input_tokens,total_output_tokens", { method: "GET" });
      const convArr = Array.isArray(convs) ? convs : [];

      // Load messages count
      const msgs = await supabase._fetch("/rest/v1/messages?select=id,conversation_id,role,input_tokens,output_tokens", { method: "GET" });
      const msgArr = Array.isArray(msgs) ? msgs : [];

      // Load feedbacks
      const fb = await supabase._fetch("/rest/v1/message_feedback?select=*&order=created_at.desc", { method: "GET" });
      const fbArr = Array.isArray(fb) ? fb : [];
      setFeedbacks(fbArr);

      // Calculate stats
      let tokIn = 0, tokOut = 0;
      msgArr.forEach(m => { tokIn += (m.input_tokens || 0); tokOut += (m.output_tokens || 0); });

      setStats({
        users: (Array.isArray(profiles) ? profiles : []).length,
        conversations: convArr.length,
        messages: msgArr.filter(m => m.role === "user").length,
        tokensInput: tokIn,
        tokensOutput: tokOut,
        feedbackPos: fbArr.filter(f => f.rating === "positive").length,
        feedbackNeg: fbArr.filter(f => f.rating === "negative").length,
      });

      // Usage by user
      const userMap = {};
      const profMap = {};
      (Array.isArray(profiles) ? profiles : []).forEach(p => { profMap[p.id] = p; });
      convArr.forEach(c => {
        if (!userMap[c.user_id]) userMap[c.user_id] = { convs: 0, tokIn: 0, tokOut: 0 };
        userMap[c.user_id].convs++;
        userMap[c.user_id].tokIn += (c.total_input_tokens || 0);
        userMap[c.user_id].tokOut += (c.total_output_tokens || 0);
      });
      const usage = Object.entries(userMap).map(([uid, d]) => ({
        ...d, user: profMap[uid]?.full_name || profMap[uid]?.email || uid,
        email: profMap[uid]?.email || "", role: profMap[uid]?.role || "",
        isAdmin: profMap[uid]?.is_admin || false,
      })).sort((a, b) => b.tokIn - a.tokIn);
      setUsageByUser(usage);

    } catch (e) { console.error("Dashboard load error:", e); }
    setLoading(false);
  };

  const formatNum = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(1) + "K";
    return n.toString();
  };

  const FONT_DISPLAY = `'Playfair Display',Georgia,serif`;

  const tabBtn = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      padding: "8px 16px", borderRadius: 8, border: "none",
      background: tab === id ? C.bgInput : "transparent",
      color: tab === id ? C.white : C.gray3,
      fontSize: 13, fontWeight: 600, fontFamily: Font, cursor: "pointer",
      transition: "all 0.15s", borderBottom: tab === id ? `2px solid ${C.green}` : "2px solid transparent"
    }}>{label}</button>
  );

  const statCard = (label, value, sub, color) => (
    <div style={{ background: C.bgInput, borderRadius: 12, padding: "16px 18px", flex: 1, minWidth: 140, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: color || C.gray3, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: C.white }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.gray4, marginTop: 2 }}>{sub}</div>}
    </div>
  );

  // Overview tab
  const renderOverview = () => (
    <div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {statCard("Usuários", stats.users, null, C.green)}
        {statCard("Conversas", stats.conversations)}
        {statCard("Mensagens", stats.messages, "do usuário")}
        {statCard("Tokens", formatNum(stats.tokensInput + stats.tokensOutput), `${formatNum(stats.tokensInput)} in · ${formatNum(stats.tokensOutput)} out`)}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        {statCard("Feedback 👍", stats.feedbackPos, null, C.green)}
        {statCard("Feedback 👎", stats.feedbackNeg, null, "#D94452")}
        {statCard("Satisfação", stats.feedbackPos + stats.feedbackNeg > 0 ? Math.round(stats.feedbackPos / (stats.feedbackPos + stats.feedbackNeg) * 100) + "%" : "—", stats.feedbackPos + stats.feedbackNeg + " votos total")}
      </div>
    </div>
  );

  // Users tab
  const renderUsers = () => (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {["Nome", "E-mail", "Cargo", "Admin", "Conversas", "Tokens"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: C.gray3, fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {usageByUser.map((u, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
              <td style={{ padding: "10px 12px", color: C.white, fontWeight: 500 }}>{u.user}</td>
              <td style={{ padding: "10px 12px", color: C.gray2 }}>{u.email}</td>
              <td style={{ padding: "10px 12px", color: C.gray2 }}>{u.role}</td>
              <td style={{ padding: "10px 12px" }}>{u.isAdmin ? <span style={{ color: C.green, fontWeight: 600 }}>✓</span> : ""}</td>
              <td style={{ padding: "10px 12px", color: C.gray1 }}>{u.convs}</td>
              <td style={{ padding: "10px 12px", color: C.gray1 }}>{formatNum(u.tokIn + u.tokOut)}</td>
            </tr>
          ))}
          {usageByUser.length === 0 && <tr><td colSpan={6} style={{ padding: 20, textAlign: "center", color: C.gray4 }}>Nenhum dado disponível</td></tr>}
        </tbody>
      </table>
    </div>
  );

  // Feedback tab
  const renderFeedback = () => {
    const negatives = feedbacks.filter(f => f.rating === "negative" && (f.tags?.length > 0 || f.comment));
    const allFb = feedbacks;
    // Tag frequency
    const tagCount = {};
    feedbacks.filter(f => f.rating === "negative").forEach(f => { (f.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }); });
    const sortedTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]);

    return (
      <div>
        {sortedTags.length > 0 && <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Tags mais frequentes</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {sortedTags.map(([tag, count]) => (
              <div key={tag} style={{ padding: "6px 14px", borderRadius: 16, background: C.bgInput, border: `1px solid ${C.border}`, fontSize: 13, color: C.gray1 }}>
                {tag} <span style={{ color: "#D94452", fontWeight: 700, marginLeft: 4 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>}

        <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Feedbacks detalhados ({negatives.length})
        </div>
        {negatives.map((f, i) => (
          <div key={i} style={{ background: C.bgInput, borderRadius: 12, padding: "14px 16px", marginBottom: 8, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 11, color: "#D94452", fontWeight: 700 }}>👎 NEGATIVO</span>
              <span style={{ fontSize: 11, color: C.gray4 }}>{new Date(f.created_at).toLocaleDateString("pt-BR")} {new Date(f.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {f.tags?.length > 0 && <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
              {f.tags.map(t => <span key={t} style={{ padding: "3px 10px", borderRadius: 12, background: C.bgCard, fontSize: 12, color: C.gray2, border: `1px solid ${C.border}` }}>{t}</span>)}
            </div>}
            {f.comment && <div style={{ fontSize: 14, color: C.gray1, marginBottom: 6, lineHeight: 1.5 }}>"{f.comment}"</div>}
            <div style={{ fontSize: 12, color: C.gray4, marginTop: 6, borderTop: `1px solid ${C.border}22`, paddingTop: 6 }}>
              <strong style={{ color: C.gray3 }}>Usuário disse:</strong> <span style={{ color: C.gray2 }}>{(f.user_message || "").substring(0, 100)}{f.user_message?.length > 100 ? "..." : ""}</span>
            </div>
            <div style={{ fontSize: 12, color: C.gray4, marginTop: 4 }}>
              <strong style={{ color: C.gray3 }}>IA respondeu:</strong> <span style={{ color: C.gray2 }}>{(f.ai_message || "").substring(0, 150)}{f.ai_message?.length > 150 ? "..." : ""}</span>
            </div>
          </div>
        ))}
        {negatives.length === 0 && <div style={{ padding: 20, textAlign: "center", color: C.gray4, background: C.bgInput, borderRadius: 12 }}>Nenhum feedback detalhado ainda.</div>}

        {allFb.length > 0 && <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.green, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
            Todos os feedbacks ({allFb.length})
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {["Data", "Rating", "Tags", "Comentário"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 10px", color: C.gray3, fontWeight: 600, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allFb.slice(0, 50).map((f, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}22` }}>
                    <td style={{ padding: "8px 10px", color: C.gray2, whiteSpace: "nowrap" }}>{new Date(f.created_at).toLocaleDateString("pt-BR")}</td>
                    <td style={{ padding: "8px 10px" }}>{f.rating === "positive" ? <span style={{ color: C.green }}>👍</span> : <span style={{ color: "#D94452" }}>👎</span>}</td>
                    <td style={{ padding: "8px 10px", color: C.gray2 }}>{(f.tags || []).join(", ") || "—"}</td>
                    <td style={{ padding: "8px 10px", color: C.gray1 }}>{(f.comment || "").substring(0, 80) || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {allFb.length > 50 && <p style={{ fontSize: 12, color: C.gray4, marginTop: 8 }}>Mostrando 50 de {allFb.length} feedbacks.</p>}
          </div>
        </div>}
      </div>
    );
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
      <div style={{ padding: "16px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: C.bgSurface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, margin: 0 }}>Painel Admin</h2>
        </div>
        <button onClick={onClose} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, color: C.gray2, padding: "6px 14px", fontSize: 13, fontFamily: Font, cursor: "pointer" }}>Voltar ao chat</button>
      </div>
      <div style={{ padding: "12px 22px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 4, background: C.bgSurface }}>
        {tabBtn("overview", "Visão Geral")}
        {tabBtn("users", "Usuários")}
        {tabBtn("feedback", "Feedbacks")}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {loading ? <div style={{ textAlign: "center", padding: 40, color: C.gray3 }}>Carregando dados...</div>
            : tab === "overview" ? renderOverview()
            : tab === "users" ? renderUsers()
            : renderFeedback()}
        </div>
      </div>
    </div>
  );
}
