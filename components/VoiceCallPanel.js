"use client";

import { useRef, useState } from "react";
import { SectionTitle } from "@/components/ui";

// Speaks `text` using ElevenLabs (via /api/tts) and resolves when playback ends.
// Falls back to the browser's speechSynthesis, then to a timed delay.
function speak(text, audioRef) {
  return new Promise(async (resolve) => {
    const safety = setTimeout(resolve, 9000); // never hang the demo
    const done = () => {
      clearTimeout(safety);
      resolve();
    };
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.status === 200) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = audioRef.current || new Audio();
        audio.src = url;
        audio.onended = done;
        audio.onerror = done;
        await audio.play().catch(() => done());
        return;
      }
    } catch {
      /* fall through to browser TTS */
    }
    // Browser speech synthesis fallback.
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.02;
      u.onend = done;
      u.onerror = done;
      window.speechSynthesis.speak(u);
      return;
    }
    // No audio available — pace by length.
    setTimeout(done, Math.min(4000, 600 + text.length * 18));
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const STATUS_META = {
  idle: { label: "Ready", color: "text-slate-500", dot: "bg-slate-300" },
  connecting: { label: "Connecting…", color: "text-amber-600", dot: "bg-amber-400" },
  "in-progress": { label: "In Progress", color: "text-emerald-600", dot: "bg-emerald-500" },
  completed: { label: "Completed", color: "text-brand-700", dot: "bg-brand-600" },
};

export default function VoiceCallPanel({ prospect, onTranscript, onComplete, onUseLive }) {
  const [status, setStatus] = useState("idle");
  const [turns, setTurns] = useState([]);
  const [running, setRunning] = useState(false);
  const audioRef = useRef(null);

  async function startCall() {
    setRunning(true);
    setTurns([]);
    setStatus("connecting");
    await sleep(1300);

    // Ask the backend for the scripted transcript (also logs the interaction).
    let data;
    try {
      const res = await fetch("/api/voice-call", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prospect_id: prospect.prospect_id }),
      });
      data = await res.json();
    } catch {
      setStatus("idle");
      setRunning(false);
      return;
    }

    setStatus("in-progress");
    const allTurns = data.turns || [];
    const shown = [];
    for (const turn of allTurns) {
      shown.push(turn);
      setTurns([...shown]);
      const isDesk = turn.speaker.includes("Helpdesk");
      if (isDesk) {
        await speak(turn.text, audioRef);
        await sleep(250);
      } else {
        await sleep(1100);
      }
    }

    setStatus("completed");
    setRunning(false);
    onTranscript?.(data.transcript);
    onComplete?.(data.transcript);
  }

  const meta = STATUS_META[status];

  return (
    <div className="card p-5">
      <SectionTitle
        icon="📞"
        title="Lead Desk (preview)"
        subtitle="Scripted briefing · no mic needed"
        right={
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {status === "in-progress" && (
                <span className={`pulse-dot absolute ${meta.color}`} />
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${meta.dot}`} />
            </span>
            <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
          </div>
        }
      />

      {turns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <div className="text-3xl mb-2">🎧</div>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Preview a scripted call to the lead desk about{" "}
            <span className="font-semibold">{prospect.business_name}</span>. The desk
            voices a quick briefing and builds your prep card — no mic required.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {turns.map((t, i) => {
            const isDesk = t.speaker.includes("Helpdesk");
            return (
              <div
                key={i}
                className={`flex ${isDesk ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    isDesk
                      ? "bg-brand-50 text-brand-900 rounded-tl-sm"
                      : "bg-slate-100 text-slate-800 rounded-tr-sm"
                  }`}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wide opacity-60 mb-0.5">
                    {t.speaker}
                  </div>
                  {t.text}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={startCall}
          disabled={running}
          className="btn-primary flex-1"
        >
          {running
            ? "Briefing in progress…"
            : status === "completed"
            ? "↻ Replay Briefing"
            : "▶ Play Scripted Briefing"}
        </button>
      </div>

      {onUseLive && (
        <button
          onClick={onUseLive}
          className="mt-2 w-full text-xs text-slate-400 hover:text-slate-600"
        >
          Switch to live call (talk to the desk)
        </button>
      )}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
}
