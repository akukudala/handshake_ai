"use client";

import { useEffect, useRef, useState } from "react";
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { SectionTitle } from "@/components/ui";
import { buildHelpdeskPrompt } from "@/lib/helpdeskPrompt";

const DESK = "Handshake Helpdesk";
const REP = "You (rep)";

const STATUS_META = {
  idle: { label: "Line ready", color: "text-slate-500", dot: "bg-slate-300" },
  connecting: { label: "Dialing the desk…", color: "text-amber-600", dot: "bg-amber-400" },
  "in-progress": { label: "On the line · Live", color: "text-emerald-600", dot: "bg-emerald-500" },
  completed: { label: "Call ended", color: "text-brand-700", dot: "bg-brand-600" },
};

// Public wrapper provides the ConversationProvider context the hook requires.
export default function HelpdeskCallPanel(props) {
  return (
    <ConversationProvider>
      <DeskInner {...props} />
    </ConversationProvider>
  );
}

function DeskInner({ prospect, agentId, onTranscript, onComplete, onUseSimulation }) {
  const [status, setStatus] = useState("idle");
  const [turns, setTurns] = useState([]);
  const [error, setError] = useState(null);

  const messagesRef = useRef([]);
  const finalizedRef = useRef(false);
  const cbRef = useRef({ onTranscript, onComplete });
  cbRef.current = { onTranscript, onComplete };

  // In this flow the AI is the helpdesk; the human is the rep.
  const speakerFor = (source) => (source === "ai" ? DESK : REP);

  async function finalize() {
    if (finalizedRef.current) return;
    finalizedRef.current = true;
    setStatus("completed");

    const text = messagesRef.current.map((t) => `${t.speaker}: ${t.text}`).join("\n");
    if (!text.trim()) return;

    try {
      await fetch("/api/voice-call", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prospect_id: prospect.prospect_id,
          transcript: text,
          turns: messagesRef.current,
        }),
      });
    } catch {
      /* still surface locally */
    }
    cbRef.current.onTranscript?.(text);
    cbRef.current.onComplete?.(text);
  }

  const conversation = useConversation({
    onConnect: () => setStatus("in-progress"),
    onDisconnect: () => finalize(),
    onError: (e) => setError(typeof e === "string" ? e : e?.message || "Connection error"),
    onMessage: (payload) => {
      const raw = payload?.message;
      const source = payload?.source || payload?.role;
      if (!raw) return;
      // Strip leaked audio/emotion tags like [happy], [laughs], [whispers].
      const text = raw.replace(/\[[a-zA-Z][a-zA-Z\s]*\]/g, "").replace(/\s{2,}/g, " ").trim();
      if (!text) return;
      const turn = { speaker: speakerFor(source), text, source };
      messagesRef.current = [...messagesRef.current, turn];
      setTurns(messagesRef.current);
    },
  });

  useEffect(() => {
    return () => {
      try {
        conversation.endSession();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const running = status === "connecting" || status === "in-progress";

  async function startCall() {
    setError(null);
    setTurns([]);
    messagesRef.current = [];
    finalizedRef.current = false;

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Microphone access is required to talk to the lead desk.");
      return;
    }

    setStatus("connecting");

    // Server-minted token keeps the API key private; fall back to public agentId.
    let token = null;
    try {
      const res = await fetch(`/api/elevenlabs/token?agent_id=${encodeURIComponent(agentId)}`);
      if (res.ok) token = (await res.json()).conversationToken;
    } catch {
      /* fall through */
    }

    // Pass THIS lead's data as dynamic variables — the agent's dashboard prompt
    // fills {{lead_context}}, {{business_name}}, etc. We deliberately do NOT send
    // `overrides` here: overrides are rejected unless explicitly enabled in the
    // agent's Security settings, and that rejection crashes the SDK.
    const { dynamicVariables } = buildHelpdeskPrompt(prospect);
    const sessionExtras = { dynamicVariables };

    try {
      await conversation.startSession(
        token
          ? { conversationToken: token, connectionType: "webrtc", ...sessionExtras }
          : { agentId, connectionType: "webrtc", ...sessionExtras }
      );
    } catch (e) {
      setStatus("idle");
      setError(
        (e?.message || "Could not connect to the lead desk.") +
          " Check the agent id, and that the API key has Conversational AI access."
      );
    }
  }

  async function endCall() {
    try {
      await conversation.endSession();
    } catch {
      finalize();
    }
  }

  const meta = STATUS_META[status];

  return (
    <div className="card p-5">
      <SectionTitle
        icon="📞"
        title="Call the Lead Desk"
        subtitle="Talk to the AI helpdesk to get briefed on this lead"
        right={
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              {status === "in-progress" && <span className={`pulse-dot absolute ${meta.color}`} />}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${meta.dot}`} />
            </span>
            <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
          </div>
        }
      />

      {error && (
        <div className="mb-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm px-3 py-2">
          {error}
        </div>
      )}

      {turns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <div className="text-3xl mb-2">🎧</div>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Call the Handshake lead desk and <span className="font-semibold">ask out loud</span> about{" "}
            <span className="font-semibold">{prospect.business_name}</span> — who they are,
            their pain points, what to pitch. Speak into your mic; the desk answers in real time.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {[
              "What do I need to know?",
              "What are their pain points?",
              "What should I pitch?",
              "Any objections?",
            ].map((q) => (
              <span
                key={q}
                className="inline-flex items-center rounded-full bg-white border border-slate-200 px-2.5 py-1 text-xs text-slate-500"
              >
                “{q}”
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {turns.map((t, i) => {
            const isDesk = t.source === "ai";
            return (
              <div key={i} className={`flex ${isDesk ? "justify-start" : "justify-end"}`}>
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

      {running && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span
            className={`h-2 w-2 rounded-full ${
              conversation.isMuted
                ? "bg-amber-400"
                : conversation.isSpeaking
                ? "bg-brand-500 animate-pulse"
                : "bg-emerald-400"
            }`}
          />
          {conversation.isMuted
            ? "Paused — your mic is muted"
            : conversation.isSpeaking
            ? "Desk is speaking…"
            : "Listening — ask your question"}
        </div>
      )}

      <div className="mt-4 flex items-center gap-2">
        {!running ? (
          <button onClick={startCall} className="btn-primary flex-1">
            {status === "completed" ? "↻ Call Again" : "📞 Call the Lead Desk"}
          </button>
        ) : (
          <>
            <button
              onClick={() => conversation.setMuted(!conversation.isMuted)}
              className="btn-secondary flex-1"
            >
              {conversation.isMuted ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button
              onClick={endCall}
              className="btn flex-1 bg-rose-600 text-white hover:bg-rose-700"
            >
              ■ Hang Up
            </button>
          </>
        )}
      </div>

      {onUseSimulation && (
        <button
          onClick={onUseSimulation}
          className="mt-2 w-full text-xs text-slate-400 hover:text-slate-600"
        >
          Preview a scripted briefing instead (no mic)
        </button>
      )}
    </div>
  );
}
