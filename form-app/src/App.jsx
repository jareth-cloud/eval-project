import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const RATING_LABELS = { 1: "Very Poor", 2: "Poor", 3: "Satisfactory", 4: "Good", 5: "Excellent" };
const RATING_COLORS = { 1: "#ef4444", 2: "#f97316", 3: "#eab308", 4: "#22c55e", 5: "#10b981" };

function RatingSelector({ label, value, onChange, error }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 8 }}>
        {label}
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(n)} style={{
            flex: 1, padding: "10px 4px", borderRadius: 8,
            border: value === n ? `2px solid ${RATING_COLORS[n]}` : "2px solid #e2e8f0",
            background: value === n ? RATING_COLORS[n] + "18" : "#fff",
            color: value === n ? RATING_COLORS[n] : "#94a3b8",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            transition: "all 0.15s", fontFamily: "inherit",
          }}>
            <div style={{ fontSize: 18, marginBottom: 2 }}>{n}</div>
            <div style={{ fontSize: 10 }}>{RATING_LABELS[n]}</div>
          </button>
        ))}
      </div>
      {error && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 6 }}>{error}</div>}
    </div>
  );
}

export default function FormApp() {
  const [form, setForm] = useState({
    projectCode: "", submissionDate: new Date().toISOString().split("T")[0],
    projectTeamPIC: "", programmerInCharge: "",
    satisfactionLevel: 0, deliveryTimeline: 0, easeOfCommunication: 0, scopeMet: 0,
    overallFeedback: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.projectCode.trim()) e.projectCode = "Required";
    if (!form.projectTeamPIC.trim()) e.projectTeamPIC = "Required";
    if (!form.programmerInCharge.trim()) e.programmerInCharge = "Required";
    if (!form.satisfactionLevel) e.satisfactionLevel = "Please select a rating";
    if (!form.deliveryTimeline) e.deliveryTimeline = "Please select a rating";
    if (!form.easeOfCommunication) e.easeOfCommunication = "Please select a rating";
    if (!form.scopeMet) e.scopeMet = "Please select a rating";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setStatus("submitting");
    try {
      const res = await fetch(`${API_URL}/api/submit`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Server error");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const inp = (err) => ({
    width: "100%", padding: "11px 14px", borderRadius: 8, fontSize: 14,
    border: `1.5px solid ${err ? "#ef4444" : "#e2e8f0"}`,
    background: "#f8fafc", color: "#0f172a", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  });

  if (status === "success") return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "60px 48px", textAlign: "center", maxWidth: 440, boxShadow: "0 4px 24px #0002" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#10b98120", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>✓</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", margin: "0 0 10px" }}>Evaluation Submitted</h2>
        <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 28px" }}>Thank you. Your evaluation for <strong>{form.projectCode}</strong> has been recorded.</p>
        <button onClick={() => { setStatus("idle"); setForm({ projectCode: "", submissionDate: new Date().toISOString().split("T")[0], projectTeamPIC: "", programmerInCharge: "", satisfactionLevel: 0, deliveryTimeline: 0, easeOfCommunication: 0, scopeMet: 0, overallFeedback: "" }); setErrors({}); }}
          style={{ padding: "12px 28px", borderRadius: 8, border: "none", background: "#1e3a8a", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
          Submit Another
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f2056, #1e3a8a)", padding: "28px 0" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>Digital Department</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>Project Evaluation Form</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", margin: "8px 0 0", fontSize: 14 }}>Complete all fields accurately to help us track collaboration with the Projects team.</p>
        </div>
      </div>

      {/* Form */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        {/* Project Details */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px", marginBottom: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>01 · Project Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Project Code *</label>
              <input style={inp(errors.projectCode)} value={form.projectCode} onChange={e => set("projectCode", e.target.value.toUpperCase())} placeholder="e.g. PROJ-2024-001" />
              {errors.projectCode && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.projectCode}</div>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Submission Date</label>
              <input type="date" style={inp()} value={form.submissionDate} onChange={e => set("submissionDate", e.target.value)} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Project Team PIC *</label>
              <input style={inp(errors.projectTeamPIC)} value={form.projectTeamPIC} onChange={e => set("projectTeamPIC", e.target.value)} placeholder="Name of person in charge" />
              {errors.projectTeamPIC && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.projectTeamPIC}</div>}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#475569", marginBottom: 6 }}>Programmer in Charge *</label>
              <input style={inp(errors.programmerInCharge)} value={form.programmerInCharge} onChange={e => set("programmerInCharge", e.target.value)} placeholder="Name of programmer" />
              {errors.programmerInCharge && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{errors.programmerInCharge}</div>}
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px", marginBottom: 20, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>02 · Performance Ratings</div>
          <RatingSelector label="Product Satisfaction Level *" value={form.satisfactionLevel} onChange={v => set("satisfactionLevel", v)} error={errors.satisfactionLevel} />
          <RatingSelector label="Delivery Timeline Adherence *" value={form.deliveryTimeline} onChange={v => set("deliveryTimeline", v)} error={errors.deliveryTimeline} />
          <RatingSelector label="Ease of Communication *" value={form.easeOfCommunication} onChange={v => set("easeOfCommunication", v)} error={errors.easeOfCommunication} />
          <RatingSelector label="Scope / Requirements Met *" value={form.scopeMet} onChange={v => set("scopeMet", v)} error={errors.scopeMet} />
        </div>

        {/* Feedback */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "24px", marginBottom: 28, border: "1px solid #e2e8f0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>03 · Open-Ended Feedback</div>
          <textarea style={{ ...inp(), height: 120, resize: "vertical", lineHeight: 1.6 }}
            value={form.overallFeedback} onChange={e => set("overallFeedback", e.target.value)}
            placeholder="Share any additional observations, highlights, or areas for improvement..." />
        </div>

        {status === "error" && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "#ef4444", fontSize: 14 }}>
            ⚠️ Submission failed. Please check your connection and try again.
          </div>
        )}

        <button onClick={handleSubmit} disabled={status === "submitting"} style={{
          width: "100%", padding: "14px", borderRadius: 10, border: "none",
          background: status === "submitting" ? "#94a3b8" : "linear-gradient(135deg, #1e3a8a, #2563eb)",
          color: "#fff", fontSize: 15, fontWeight: 700, cursor: status === "submitting" ? "not-allowed" : "pointer",
          letterSpacing: "0.02em", fontFamily: "inherit", boxShadow: "0 4px 14px #2563eb33",
        }}>
          {status === "submitting" ? "Submitting…" : "Submit Evaluation →"}
        </button>
      </div>
    </div>
  );
}
