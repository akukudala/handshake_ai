"use client";

import { useState } from "react";
import { SectionTitle } from "@/components/ui";

export default function RepNotes({ prospect, value, onChange, onSaved }) {
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  async function save() {
    if (!value.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/interactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prospect_id: prospect.prospect_id, note: value }),
      });
      setSavedMsg("Saved to lead memory ✓");
      setTimeout(() => setSavedMsg(""), 2500);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <SectionTitle
        icon="📝"
        title="Rep Notes"
        subtitle="Feeds into the AI meeting prep"
        right={
          savedMsg ? (
            <span className="text-xs text-emerald-600 font-medium">{savedMsg}</span>
          ) : null
        }
      />
      <textarea
        className="input min-h-[96px] resize-y"
        placeholder="Add context for the AI: budget signals, timing, decision makers…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex justify-end mt-3">
        <button className="btn-secondary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Note to Memory"}
        </button>
      </div>
    </div>
  );
}
