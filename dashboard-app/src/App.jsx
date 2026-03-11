import { useState, useEffect, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const DASHBOARD_SECRET = import.meta.env.VITE_DASHBOARD_SECRET || "digital-dept-2024";

const RATING_LABELS = { 1: "Very Poor", 2: "Poor", 3: "Satisfactory", 4: "Good", 5: "Excellent" };
const RATING_COLORS = { 1: "#ef4444", 2: "#f97316", 3: "#eab308", 4: "#22c55e", 5: "#10b981" };

function RatingBadge({ value }) {
  if (!value) return <span style={{ color: "#cbd5e1" }}>—</span>;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      background: RATING_COLORS[value] + "18", color: RATING_COLORS[value],
      border: `1px solid ${RATING_COLORS[value]}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 700,
    }}>★ {value} · {RATING_LABELS[value]}</span>
  );
}

function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const attempt = () => {
    if (password === DASHBOARD_SECRET) { onLogin(); }
    else { setError(true); setPassword(""); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f2056 0%, #1e3a8a 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "48px 40px", maxWidth: 380, width: "100%", boxShadow: "0 20px 60px #0004" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: "0 0 8px" }}>Dashboard Access</h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>Digital Department · Evaluations</p>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            onKeyDown={e => e.key === "Enter" && attempt()}
            placeholder="Enter dashboard password"
            style={{ width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 14, border: `1.5px solid ${error ? "#ef4444" : "#e2e8f0"}`, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
          />
          {error && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>Incorrect password. Try again.</div>}
        </div>
        <button onClick={attempt} style={{ width: "100%", padding: "13px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #1e3a8a, #2563eb)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Access Dashboard →
        </button>
      </div>
    </div>
  );
}

export default function DashboardApp() {
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortDir, setSortDir] = useState("desc");
  const [expanded, setExpanded] = useState(null);
  const [filterRating, setFilterRating] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/evaluations`, {
        headers: { "x-dashboard-secret": DASHBOARD_SECRET },
      });
      if (!res.ok) throw new Error();
      setData(await res.json());
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { if (authed) load(); }, [authed, load]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this evaluation?")) return;
    await fetch(`${API_URL}/api/evaluations/${id}`, {
      method: "DELETE", headers: { "x-dashboard-secret": DASHBOARD_SECRET },
    });
    load();
  };

  const filtered = data
    .filter(s => {
      const q = search.toLowerCase();
      const matchesSearch = s.projectCode.toLowerCase().includes(q) || s.projectTeamPIC.toLowerCase().includes(q) || s.programmerInCharge.toLowerCase().includes(q);
      const matchesRating = !filterRating || s.satisfactionLevel === filterRating;
      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      let va = a[sortBy], vb = b[sortBy];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const avg = (field) => {
    const vals = data.filter(s => s[field]).map(s => s[field]);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : "—";
  };

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }) => <span style={{ marginLeft: 4, opacity: sortBy === col ? 0.8 : 0.2 }}>{sortBy === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}</span>;

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f2056, #1e3a8a)", padding: "22px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Digital Department</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "4px 0 0" }}>Evaluations Dashboard</h1>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={load} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>↻ Refresh</button>
            <button onClick={() => setAuthed(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Sign Out</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px" }}>
        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { label: "Total Submissions", value: data.length, sub: "all time" },
            { label: "Avg Satisfaction", value: avg("satisfactionLevel"), sub: "out of 5" },
            { label: "Avg Delivery", value: avg("deliveryTimeline"), sub: "out of 5" },
            { label: "Avg Communication", value: avg("easeOfCommunication"), sub: "out of 5" },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "18px 22px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#0f172a", margin: "6px 0 2px", letterSpacing: "-0.03em" }}>{value}</div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <input
            style={{ flex: 1, padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", background: "#fff", outline: "none" }}
            placeholder="🔍  Search by project code, PIC or programmer…"
            value={search} onChange={e => setSearch(e.target.value)}
          />
          <select value={filterRating} onChange={e => setFilterRating(Number(e.target.value))}
            style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 14, fontFamily: "inherit", background: "#fff", outline: "none", cursor: "pointer" }}>
            <option value={0}>All ratings</option>
            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} — {RATING_LABELS[n]}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8" }}>Loading…</div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#94a3b8", background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No evaluations yet</div>
          </div>
        ) : (
          <div style={{ borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead style={{ borderBottom: "2px solid #e2e8f0" }}>
                <tr>
                  {[
                    ["projectCode", "Project Code"],
                    ["submissionDate", "Date"],
                    ["projectTeamPIC", "Team PIC"],
                    ["programmerInCharge", "Programmer"],
                    ["satisfactionLevel", "Satisfaction"],
                    ["deliveryTimeline", "Delivery"],
                    ["easeOfCommunication", "Comms"],
                    ["scopeMet", "Scope"],
                  ].map(([col, lbl]) => (
                    <th key={col} onClick={() => toggleSort(col)} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer", whiteSpace: "nowrap", background: sortBy === col ? "#f8fafc" : "transparent" }}>
                      {lbl}<SortIcon col={col} />
                    </th>
                  ))}
                  <th style={{ padding: "10px 16px" }}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <>
                    <tr key={s.id} onClick={() => setExpanded(expanded === s.id ? null : s.id)} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer", background: expanded === s.id ? "#f8fafc" : i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: "#1e3a8a", fontFamily: "monospace" }}>{s.projectCode}</td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{s.submissionDate}</td>
                      <td style={{ padding: "12px 16px" }}>{s.projectTeamPIC}</td>
                      <td style={{ padding: "12px 16px" }}>{s.programmerInCharge}</td>
                      <td style={{ padding: "12px 16px" }}><RatingBadge value={s.satisfactionLevel} /></td>
                      <td style={{ padding: "12px 16px" }}><RatingBadge value={s.deliveryTimeline} /></td>
                      <td style={{ padding: "12px 16px" }}><RatingBadge value={s.easeOfCommunication} /></td>
                      <td style={{ padding: "12px 16px" }}><RatingBadge value={s.scopeMet} /></td>
                      <td style={{ padding: "12px 16px", textAlign: "right", color: "#94a3b8", fontSize: 11 }}>{expanded === s.id ? "▲" : "▼"}</td>
                    </tr>
                    {expanded === s.id && (
                      <tr key={s.id + "_exp"} style={{ background: "#f8fafc" }}>
                        <td colSpan={9} style={{ padding: "16px 24px", borderBottom: "2px solid #e2e8f0" }}>
                          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Open-Ended Feedback</div>
                              <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, background: "#fff", borderRadius: 8, padding: "12px 16px", border: "1px solid #e2e8f0" }}>
                                {s.overallFeedback || <em style={{ color: "#cbd5e1" }}>No feedback provided.</em>}
                              </div>
                              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 8 }}>Submitted: {new Date(s.submittedAt).toLocaleString()}</div>
                            </div>
                            <button onClick={e => { e.stopPropagation(); handleDelete(s.id); }} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #fecaca", background: "#fff", color: "#ef4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>No results match your filters.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
