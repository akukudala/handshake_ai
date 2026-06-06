"use client";

import { useState } from "react";
import { SectionTitle } from "@/components/ui";

export default function AppointmentPanel({ prospect, appointments, onCreated }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(appointments.length === 0);

  async function submit(e) {
    e.preventDefault();
    if (!date) return;
    setSaving(true);
    try {
      await fetch("/api/appointments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prospect_id: prospect.prospect_id,
          appointment_date: date,
          appointment_time: time,
          notes,
        }),
      });
      setNotes("");
      setDate("");
      setOpen(false);
      onCreated?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <SectionTitle
        icon="📅"
        title="Appointments"
        subtitle="Book and track meetings with this prospect"
        right={
          <button
            className="btn-ghost text-xs"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide" : "+ New"}
          </button>
        }
      />

      {appointments.length > 0 && (
        <div className="space-y-2 mb-3">
          {appointments.map((a) => (
            <div
              key={a.appointment_id}
              className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <div>
                <div className="text-sm font-semibold text-slate-800">
                  {a.appointment_date} · {a.appointment_time}
                </div>
                {a.notes ? (
                  <div className="text-xs text-slate-500">{a.notes}</div>
                ) : null}
              </div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-xs font-semibold">
                {a.appointment_status}
              </span>
            </div>
          ))}
        </div>
      )}

      {open && (
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Time</label>
              <input
                type="time"
                className="input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input
              className="input"
              placeholder="e.g. Demo the checkout flow, bring pricing sheet"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button className="btn-primary w-full" disabled={saving}>
            {saving ? "Saving…" : "Create Appointment"}
          </button>
        </form>
      )}
    </div>
  );
}
