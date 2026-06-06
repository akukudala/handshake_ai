// LLM-backed meeting-prep generation with a graceful mock fallback.
// Supports Anthropic (Claude) and OpenAI. If no key is configured, a
// deterministic heuristic generator is used so the demo always works.

const PREP_SYSTEM_PROMPT =
  "You are a senior B2B sales coach for a payments/checkout solutions company. " +
  "Given a prospect profile, appointment details, past interaction history, rep notes, " +
  "and the latest AI voice-call transcript, produce a concise, practical meeting prep card. " +
  "Be specific and reference details from the transcript. Respond with STRICT JSON only.";

// JSON shape we ask the model for (and that the UI renders).
const PREP_SCHEMA_HINT = `Return ONLY a JSON object with exactly these keys:
{
  "business_summary": string (2 sentences),
  "interest_level": "High" | "Medium" | "Low",
  "key_pain_points": string[] (2-4 items),
  "conversation_starter": string (1 sentence the rep can open with),
  "recommended_pitch": string (the product angle to lead with),
  "objection_to_prepare_for": string,
  "next_best_action": string,
  "context_from_history": string (1-2 sentences; "No prior interactions on record." if none)
}`;

function buildUserPrompt({ prospect, appointment, history, repNotes, transcript }) {
  const historyText =
    history && history.length
      ? history
          .map(
            (h) =>
              `- [${h.created_at}] ${h.interaction_type}: ${
                h.ai_summary || h.transcript || h.next_best_action || "(record)"
              }`
          )
          .join("\n")
      : "None on record.";

  return `PROSPECT PROFILE
${JSON.stringify(prospect, null, 2)}

APPOINTMENT
${appointment ? JSON.stringify(appointment, null, 2) : "No appointment scheduled yet."}

PAST INTERACTION HISTORY
${historyText}

REP NOTES
${repNotes && repNotes.trim() ? repNotes : "None."}

LATEST AI VOICE-CALL TRANSCRIPT
${transcript || "No call transcript yet."}

${PREP_SCHEMA_HINT}`;
}

function safeParseJson(text) {
  if (!text) return null;
  // Strip markdown fences if present.
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function callAnthropic(userPrompt) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: PREP_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = (data.content || []).map((c) => c.text || "").join("");
  return safeParseJson(text);
}

async function callOpenAI(userPrompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PREP_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`OpenAI API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  return safeParseJson(text);
}

// Deterministic fallback so the demo works with zero keys.
function mockPrep({ prospect, history }) {
  const pains = prospect.likely_pain_points || [];
  const score = prospect.match_score || 70;
  const interest = score >= 85 ? "High" : score >= 72 ? "Medium" : "Low";
  return {
    business_summary: `${prospect.business_name} is a ${prospect.industry.toLowerCase()} business — ${prospect.business_description} They currently use ${prospect.current_provider}, which is creating friction in how they get paid.`,
    interest_level: interest,
    key_pain_points: pains.length
      ? pains
      : ["Payment delays", "High processing fees", "Manual reconciliation"],
    conversation_starter: `"${prospect.owner_name.split(" ")[0]}, you mentioned ${(
      pains[0] || "payment delays"
    ).toLowerCase()} — walk me through what that costs you in a typical week."`,
    recommended_pitch: `Lead with faster payouts and an integrated checkout that replaces ${prospect.current_provider}, framed around reclaiming time and reducing fees.`,
    objection_to_prepare_for: `"Switching from ${prospect.current_provider} sounds disruptive." — be ready with a low-friction migration story and cost comparison.`,
    next_best_action:
      prospect.status === "Appointment Set"
        ? "Confirm the appointment and send a one-page cost comparison beforehand."
        : "Book the meeting and prepare a tailored savings estimate.",
    context_from_history:
      history && history.length
        ? `${history.length} prior interaction(s) on record — most recent: ${history[0].interaction_type}.`
        : "No prior interactions on record.",
  };
}

// Returns { prep, source } where source is "anthropic" | "openai" | "mock".
async function generateMeetingPrep(args) {
  const userPrompt = buildUserPrompt(args);
  // Prefer Anthropic, then OpenAI, then mock.
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      const prep = await callAnthropic(userPrompt);
      if (prep) return { prep, source: "anthropic" };
    }
    if (process.env.OPENAI_API_KEY) {
      const prep = await callOpenAI(userPrompt);
      if (prep) return { prep, source: "openai" };
    }
  } catch (err) {
    // Fall through to mock on any provider error.
    console.error("[llm] provider failed, using mock fallback:", err.message);
  }
  return { prep: mockPrep(args), source: "mock" };
}

module.exports = { generateMeetingPrep, PREP_SYSTEM_PROMPT };
