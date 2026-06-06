// File-backed JSON "database" for the Handshake AI MVP.
// Tables: prospects, appointments, interaction_history (aka lead_memory), rep.
// On first access it seeds data/db.json from lib/seedData.js.
//
// This is intentionally simple (no native deps) so the demo runs anywhere.

const fs = require("fs");
const path = require("path");
const { prospects: seedProspects, rep: seedRep } = require("./seedData");

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

function ensureLoaded() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial = {
      prospects: seedProspects,
      rep: seedRep,
      appointments: [],
      interaction_history: [],
      _counters: { appointment: 1, interaction: 1 },
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
}

function read() {
  return ensureLoaded();
}

function write(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  return db;
}

function nowISO() {
  return new Date().toISOString();
}

// ── Rep ───────────────────────────────────────────────────────
function getRep() {
  return read().rep;
}

// ── Prospects ─────────────────────────────────────────────────
function getProspects() {
  return read().prospects;
}

function getProspect(id) {
  return read().prospects.find((p) => p.prospect_id === id) || null;
}

function updateProspectStatus(id, status) {
  const db = read();
  const p = db.prospects.find((x) => x.prospect_id === id);
  if (!p) return null;
  p.status = status;
  write(db);
  return p;
}

// ── Appointments ──────────────────────────────────────────────
function getAppointmentsForProspect(prospectId) {
  return read()
    .appointments.filter((a) => a.prospect_id === prospectId)
    .sort((a, b) =>
      `${a.appointment_date} ${a.appointment_time}`.localeCompare(
        `${b.appointment_date} ${b.appointment_time}`
      )
    );
}

function createAppointment(input) {
  const db = read();
  const id = `appt-${String(db._counters.appointment).padStart(3, "0")}`;
  db._counters.appointment += 1;
  const appointment = {
    appointment_id: id,
    prospect_id: input.prospect_id,
    rep_id: input.rep_id || db.rep.rep_id,
    appointment_date: input.appointment_date,
    appointment_time: input.appointment_time,
    appointment_status: input.appointment_status || "Scheduled",
    notes: input.notes || "",
    created_at: nowISO(),
  };
  db.appointments.push(appointment);
  // Setting an appointment advances the prospect status.
  const p = db.prospects.find((x) => x.prospect_id === input.prospect_id);
  if (p && p.status !== "Not Interested") p.status = "Appointment Set";
  write(db);
  return appointment;
}

// ── Interaction history / lead memory ─────────────────────────
function getInteractionsForProspect(prospectId) {
  return read()
    .interaction_history.filter((i) => i.prospect_id === prospectId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function createInteraction(input) {
  const db = read();
  const id = `int-${String(db._counters.interaction).padStart(3, "0")}`;
  db._counters.interaction += 1;
  const interaction = {
    interaction_id: id,
    prospect_id: input.prospect_id,
    rep_id: input.rep_id || db.rep.rep_id,
    interaction_type: input.interaction_type, // Voice Call | Appointment | Note | Prep Summary
    transcript: input.transcript || null,
    ai_summary: input.ai_summary || null,
    pain_points: input.pain_points || null,
    conversation_starters: input.conversation_starters || null,
    recommended_pitch: input.recommended_pitch || null,
    next_best_action: input.next_best_action || null,
    extra: input.extra || null, // arbitrary structured payload (e.g. full prep card)
    created_at: nowISO(),
  };
  db.interaction_history.push(interaction);
  write(db);
  return interaction;
}

module.exports = {
  getRep,
  getProspects,
  getProspect,
  updateProspectStatus,
  getAppointmentsForProspect,
  createAppointment,
  getInteractionsForProspect,
  createInteraction,
};
