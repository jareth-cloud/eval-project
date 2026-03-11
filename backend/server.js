const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const DASHBOARD_SECRET = process.env.DASHBOARD_SECRET || "digital-dept-2024";

// Database setup
const db = new Database(path.join(__dirname, "evaluations.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS evaluations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    projectCode TEXT NOT NULL,
    submissionDate TEXT,
    projectTeamPIC TEXT,
    programmerInCharge TEXT,
    satisfactionLevel INTEGER,
    deliveryTimeline INTEGER,
    easeOfCommunication INTEGER,
    scopeMet INTEGER,
    overallFeedback TEXT,
    submittedAt TEXT DEFAULT (datetime('now'))
  )
`);

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "DELETE"],
}));
app.use(express.json());

// ── Public: Submit evaluation ─────────────────────────────
app.post("/api/submit", (req, res) => {
  const {
    projectCode, submissionDate, projectTeamPIC, programmerInCharge,
    satisfactionLevel, deliveryTimeline, easeOfCommunication, scopeMet,
    overallFeedback
  } = req.body;

  if (!projectCode || !projectTeamPIC || !programmerInCharge) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const stmt = db.prepare(`
    INSERT INTO evaluations
      (projectCode, submissionDate, projectTeamPIC, programmerInCharge,
       satisfactionLevel, deliveryTimeline, easeOfCommunication, scopeMet, overallFeedback)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    projectCode.toUpperCase(), submissionDate, projectTeamPIC, programmerInCharge,
    satisfactionLevel, deliveryTimeline, easeOfCommunication, scopeMet,
    overallFeedback || ""
  );
  res.json({ success: true, id: result.lastInsertRowid });
});

// ── Dashboard auth middleware ─────────────────────────────
function requireSecret(req, res, next) {
  const secret = req.headers["x-dashboard-secret"];
  if (secret !== DASHBOARD_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ── Protected: Get all evaluations ───────────────────────
app.get("/api/evaluations", requireSecret, (req, res) => {
  const rows = db.prepare("SELECT * FROM evaluations ORDER BY submittedAt DESC").all();
  res.json(rows);
});

// ── Protected: Delete evaluation ─────────────────────────
app.delete("/api/evaluations/:id", requireSecret, (req, res) => {
  db.prepare("DELETE FROM evaluations WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ── Health check ─────────────────────────────────────────
app.get("/", (req, res) => res.json({ status: "ok", service: "eval-backend" }));

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
