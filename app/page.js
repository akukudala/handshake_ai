"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { StatusBadge, ScoreBadge, Pill } from "@/components/ui";

const STATUSES = ["All", "New", "Called", "Appointment Set", "Not Interested"];

export default function Dashboard() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All");
  const [status, setStatus] = useState("All");
  const [maxDistance, setMaxDistance] = useState(15);
  const [minScore, setMinScore] = useState(0);
  const [sortBy, setSortBy] = useState("score");

  useEffect(() => {
    fetch("/api/prospects")
      .then((r) => r.json())
      .then((d) => setProspects(d.prospects || []))
      .finally(() => setLoading(false));
  }, []);

  const industries = useMemo(
    () => ["All", ...Array.from(new Set(prospects.map((p) => p.industry))).sort()],
    [prospects]
  );

  const filtered = useMemo(() => {
    let list = prospects.filter((p) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !q ||
        p.business_name.toLowerCase().includes(q) ||
        p.owner_name.toLowerCase().includes(q) ||
        p.industry.toLowerCase().includes(q);
      const matchesIndustry = industry === "All" || p.industry === industry;
      const matchesStatus = status === "All" || p.status === status;
      const matchesDistance = p.distance_miles <= maxDistance;
      const matchesScore = p.match_score >= minScore;
      return (
        matchesQuery &&
        matchesIndustry &&
        matchesStatus &&
        matchesDistance &&
        matchesScore
      );
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "score") return b.match_score - a.match_score;
      if (sortBy === "distance") return a.distance_miles - b.distance_miles;
      if (sortBy === "name") return a.business_name.localeCompare(b.business_name);
      return 0;
    });
    return list;
  }, [prospects, query, industry, status, maxDistance, minScore, sortBy]);

  const stats = useMemo(() => {
    return {
      total: prospects.length,
      appts: prospects.filter((p) => p.status === "Appointment Set").length,
      called: prospects.filter((p) => p.status === "Called").length,
      hot: prospects.filter((p) => p.match_score >= 85).length,
    };
  }, [prospects]);

  return (
    <div>
      {/* Hero / location banner */}
      <div className="card p-5 mb-6 bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-brand-100/80 font-semibold">
              📍 Nearby prospects · San Francisco, CA
            </div>
            <h1 className="text-2xl font-bold mt-1">Good morning, Alex 👋</h1>
            <p className="text-brand-100/90 text-sm mt-1">
              Here are the highest-fit businesses within your territory today.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center">
            <Stat label="In range" value={stats.total} />
            <Stat label="Hot fit" value={stats.hot} />
            <Stat label="Called" value={stats.called} />
            <Stat label="Booked" value={stats.appts} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <label className="label">Search</label>
            <input
              className="input"
              placeholder="Business, owner, or industry…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Industry</label>
            <select
              className="input"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              {industries.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Status</label>
            <select
              className="input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Within {maxDistance} mi</label>
            <input
              type="range"
              min="1"
              max="15"
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Min score {minScore}</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            {filtered.length} of {prospects.length} prospects
          </span>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Sort by</span>
            {[
              ["score", "Match score"],
              ["distance", "Distance"],
              ["name", "Name"],
            ].map(([key, lbl]) => (
              <button
                key={key}
                onClick={() => setSortBy(key)}
                className={`px-2.5 py-1 rounded-lg font-medium ${
                  sortBy === key
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Prospect grid */}
      {loading ? (
        <div className="text-center text-slate-400 py-16">Loading prospects…</div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-slate-400">
          No prospects match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link
              key={p.prospect_id}
              href={`/prospects/${p.prospect_id}`}
              className="card p-4 hover:shadow-cardhover transition group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-brand-700 transition">
                    {p.business_name}
                  </div>
                  <div className="text-xs text-slate-500">{p.owner_name}</div>
                </div>
                <ScoreBadge score={p.match_score} />
              </div>

              <div className="flex flex-wrap gap-1.5 mt-3">
                <Pill>{p.industry}</Pill>
                <Pill>{p.distance_miles} mi</Pill>
              </div>

              <p className="text-xs text-slate-600 mt-3 line-clamp-2">
                {p.business_description}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Uses <span className="font-medium">{p.current_provider}</span>
                </div>
                <StatusBadge status={p.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white/15 rounded-xl px-3 py-2 min-w-[64px]">
      <div className="text-xl font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-brand-100/80">
        {label}
      </div>
    </div>
  );
}
