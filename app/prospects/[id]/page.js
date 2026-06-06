"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StatusBadge, ScoreBadge, Pill, SectionTitle } from "@/components/ui";
import AppointmentPanel from "@/components/AppointmentPanel";
import VoiceCallPanel from "@/components/VoiceCallPanel";
import HelpdeskCallPanel from "@/components/HelpdeskCallPanel";
import MeetingPrepCard from "@/components/MeetingPrepCard";
import HistoryTimeline from "@/components/HistoryTimeline";
import RepNotes from "@/components/RepNotes";

export default function ProspectDetail({ params }) {
  const { id } = params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [repNotes, setRepNotes] = useState("");
  const [transcript, setTranscript] = useState("");
  const [prep, setPrep] = useState(null);
  const [prepSource, setPrepSource] = useState(null);
  const [prepLoading, setPrepLoading] = useState(false);

  // Live ElevenLabs agent is enabled when an agent id is configured.
  const liveAgentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "";
  const [callMode, setCallMode] = useState(liveAgentId ? "live" : "sim");

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/prospects/${id}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // After the voice call completes, automatically generate the prep card.
  const generatePrep = useCallback(
    async (callTranscript) => {
      setPrepLoading(true);
      setPrep(null);
      try {
        const res = await fetch("/api/prep", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            prospect_id: id,
            transcript: callTranscript || transcript,
            rep_notes: repNotes,
          }),
        });
        const out = await res.json();
        setPrep(out.prep);
        setPrepSource(out.source);
        await refresh(); // pick up the new interactions in the timeline
      } finally {
        setPrepLoading(false);
      }
    },
    [id, transcript, repNotes, refresh]
  );

  if (loading) {
    return <div className="text-center text-slate-400 py-20">Loading prospect…</div>;
  }
  if (!data?.prospect) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Prospect not found.</p>
        <Link href="/" className="btn-secondary mt-4">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const { prospect, appointments, interactions } = data;

  return (
    <div>
      <Link
        href="/"
        className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 mb-4"
      >
        ← Back to prospects
      </Link>

      {/* Prospect header */}
      <div className="card p-6 mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">
                {prospect.business_name}
              </h1>
              <StatusBadge status={prospect.status} />
            </div>
            <p className="text-slate-500 mt-1">
              {prospect.owner_name} · {prospect.phone_number}
            </p>
            <p className="text-sm text-slate-600 mt-3 max-w-2xl">
              {prospect.business_description}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              <Pill>{prospect.industry}</Pill>
              <Pill>{prospect.distance_miles} mi away</Pill>
              <Pill>{prospect.address}</Pill>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ScoreBadge score={prospect.match_score} />
            <div className="text-right text-sm">
              <div className="text-slate-400 text-xs">Est. revenue</div>
              <div className="font-semibold text-slate-800">
                {prospect.estimated_revenue}
              </div>
            </div>
            <div className="text-right text-sm">
              <div className="text-slate-400 text-xs">Current provider</div>
              <div className="font-semibold text-slate-800">
                {prospect.current_provider}
              </div>
            </div>
          </div>
        </div>

        {prospect.likely_pain_points?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="label">Likely pain points</div>
            <div className="flex flex-wrap gap-1.5">
              {prospect.likely_pain_points.map((p, i) => (
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: workflow */}
        <div className="lg:col-span-2 space-y-5">
          {callMode === "live" && liveAgentId ? (
            <HelpdeskCallPanel
              prospect={prospect}
              agentId={liveAgentId}
              onTranscript={setTranscript}
              onComplete={generatePrep}
              onUseSimulation={() => setCallMode("sim")}
            />
          ) : (
            <VoiceCallPanel
              prospect={prospect}
              onTranscript={setTranscript}
              onComplete={generatePrep}
              onUseLive={liveAgentId ? () => setCallMode("live") : null}
            />
          )}
          <MeetingPrepCard prep={prep} source={prepSource} loading={prepLoading} />
          <HistoryTimeline interactions={interactions} />
        </div>

        {/* Right column: appointment + notes */}
        <div className="space-y-5">
          <AppointmentPanel
            prospect={prospect}
            appointments={appointments}
            onCreated={refresh}
          />
          <RepNotes
            prospect={prospect}
            value={repNotes}
            onChange={setRepNotes}
            onSaved={refresh}
          />
          {prep && (
            <div className="card p-5">
              <SectionTitle icon="✅" title="Ready for the meeting" />
              <p className="text-sm text-slate-600">
                Prep card generated and saved to lead memory. Re-run the call or
                update notes anytime to refresh it.
              </p>
              <button
                className="btn-secondary w-full mt-3"
                onClick={() => generatePrep(transcript)}
              >
                ↻ Regenerate with current notes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
