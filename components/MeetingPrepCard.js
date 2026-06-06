"use client";

import { SectionTitle, InterestBadge } from "@/components/ui";

export default function MeetingPrepCard({ prep, source, loading }) {
  if (loading) {
    return (
      <div className="card p-5">
        <SectionTitle icon="🧠" title="Meeting Prep Card" />
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-5/6" />
          <div className="h-20 bg-slate-100 rounded" />
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Generating prep from the call transcript, profile, and history…
        </p>
      </div>
    );
  }

  if (!prep) {
    return (
      <div className="card p-5">
        <SectionTitle
          icon="🧠"
          title="Meeting Prep Card"
          subtitle="Generated after the AI voice call"
        />
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
          Run the AI voice call to generate your meeting prep card.
        </div>
      </div>
    );
  }

  const sourceLabel =
    source === "anthropic"
      ? "Claude"
      : source === "openai"
      ? "OpenAI"
      : "Demo (mock)";

  const pains = Array.isArray(prep.key_pain_points)
    ? prep.key_pain_points
    : String(prep.key_pain_points || "")
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);

  return (
    <div className="card p-5 ring-1 ring-brand-100">
      <SectionTitle
        icon="🧠"
        title="Meeting Prep Card"
        subtitle={`AI-generated · ${sourceLabel}`}
        right={<InterestBadge level={prep.interest_level} />}
      />

      <p className="text-sm text-slate-700 leading-relaxed">
        {prep.business_summary}
      </p>

      {pains.length > 0 && (
        <div className="mt-4">
          <div className="label">Key pain points</div>
          <div className="flex flex-wrap gap-1.5">
            {pains.map((p, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-lg bg-rose-50 text-rose-700 px-2.5 py-1 text-xs font-medium"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        <Field icon="💬" title="Best conversation starter" value={prep.conversation_starter} accent="brand" />
        <Field icon="🎯" title="Recommended pitch" value={prep.recommended_pitch} accent="emerald" />
        <Field icon="🛡️" title="Objection to prepare for" value={prep.objection_to_prepare_for} accent="amber" />
        <Field icon="⏭️" title="Next best action" value={prep.next_best_action} accent="brand" />
      </div>

      {prep.context_from_history && (
        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
          <div className="label !mb-0.5">Context from previous interactions</div>
          <p className="text-sm text-slate-600">{prep.context_from_history}</p>
        </div>
      )}
    </div>
  );
}

function Field({ icon, title, value, accent }) {
  const ring = {
    brand: "ring-brand-100 bg-brand-50/40",
    emerald: "ring-emerald-100 bg-emerald-50/40",
    amber: "ring-amber-100 bg-amber-50/40",
  }[accent];
  return (
    <div className={`rounded-xl ring-1 ${ring} p-3`}>
      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
        <span>{icon}</span>
        {title}
      </div>
      <p className="text-sm text-slate-700 mt-1 leading-snug">{value}</p>
    </div>
  );
}
