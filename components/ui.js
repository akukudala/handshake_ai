// Small presentational helpers shared across pages.

export function StatusBadge({ status }) {
  const map = {
    New: "bg-slate-100 text-slate-700",
    Called: "bg-amber-100 text-amber-800",
    "Appointment Set": "bg-emerald-100 text-emerald-800",
    "Not Interested": "bg-rose-100 text-rose-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        map[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export function ScoreBadge({ score }) {
  const color =
    score >= 85
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : score >= 72
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-slate-50 text-slate-600 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold ring-1 ${color}`}
      title="Match score"
    >
      ★ {score}
    </span>
  );
}

export function InterestBadge({ level }) {
  const map = {
    High: "bg-emerald-100 text-emerald-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
        map[level] || "bg-slate-100 text-slate-700"
      }`}
    >
      {level} interest
    </span>
  );
}

export function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 px-2.5 py-0.5 text-xs font-medium">
      {children}
    </span>
  );
}

export function SectionTitle({ icon, title, subtitle, right }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-3">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          {icon ? <span className="text-base">{icon}</span> : null}
          {title}
        </h3>
        {subtitle ? (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      {right}
    </div>
  );
}

export function interactionIcon(type) {
  return (
    {
      "Voice Call": "📞",
      Appointment: "📅",
      Note: "📝",
      "Prep Summary": "🧠",
    }[type] || "•"
  );
}
