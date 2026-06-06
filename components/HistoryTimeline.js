"use client";

import { useState } from "react";
import { SectionTitle, interactionIcon } from "@/components/ui";

function fmt(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function HistoryTimeline({ interactions }) {
  return (
    <div className="card p-5">
      <SectionTitle
        icon="🗂️"
        title="Lead Memory & Interaction History"
        subtitle="Everything the AI remembers about this prospect"
        right={
          <span className="text-xs text-slate-400">
            {interactions.length} record{interactions.length === 1 ? "" : "s"}
          </span>
        }
      />

      {interactions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          No interactions yet. Book an appointment or run an AI voice call.
        </div>
      ) : (
        <ol className="relative border-l-2 border-slate-100 ml-3 space-y-4">
          {interactions.map((it) => (
            <TimelineItem key={it.interaction_id} it={it} />
          ))}
        </ol>
      )}
    </div>
  );
}

function TimelineItem({ it }) {
  const [showTranscript, setShowTranscript] = useState(false);
  return (
    <li className="ml-5">
      <span className="absolute -left-[13px] grid place-items-center h-6 w-6 rounded-full bg-white ring-2 ring-slate-100 text-xs">
        {interactionIcon(it.interaction_type)}
      </span>
      <div className="rounded-xl border border-slate-100 bg-white p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-slate-800">
            {it.interaction_type}
          </span>
          <span className="text-[11px] text-slate-400">{fmt(it.created_at)}</span>
        </div>
        {it.ai_summary && (
          <p className="text-sm text-slate-600 mt-1">{it.ai_summary}</p>
        )}
        {it.next_best_action && (
          <p className="text-xs text-brand-700 mt-1">
            ⏭️ {it.next_best_action}
          </p>
        )}
        {it.transcript && (
          <div className="mt-2">
            <button
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
              onClick={() => setShowTranscript((v) => !v)}
            >
              {showTranscript ? "Hide transcript ▲" : "View transcript ▼"}
            </button>
            {showTranscript && (
              <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-600 bg-slate-50 rounded-lg p-3 max-h-56 overflow-y-auto">
                {it.transcript}
              </pre>
            )}
          </div>
        )}
      </div>
    </li>
  );
}
