// Deterministic "Lead Desk" briefing simulator.
// Used as a no-setup fallback when no live ElevenLabs agent is configured:
// it scripts a rep ⇄ helpdesk briefing about the lead so the demo still works.

const REP = "You (rep)";
const DESK = "Handshake Helpdesk";

// Questions the rep asks the desk (also reused as suggested prompts in the UI).
const REP_QUESTIONS = [
  "Hey, can you brief me on this lead before my meeting?",
  "What are their main pain points?",
  "What should I lead with — what's the pitch?",
  "Any objections I should be ready for?",
];

function deskAnswers(p) {
  const provider = p.current_provider || "their current setup";
  const pains = p.likely_pain_points || [];
  const firstName = (p.owner_name || "the owner").split(" ")[0];

  return [
    `Sure. ${p.business_name} is a ${p.industry.toLowerCase()} business — ${p.business_description} ` +
      `${firstName} runs it, they're about ${p.distance_miles} miles out, and they're on ${provider} today.`,
    pains.length
      ? `Biggest ones: ${pains.slice(0, 2).join(", and ").toLowerCase()}. That's costing ${firstName} time every week.`
      : `Mostly payment delays and manual reconciliation from what we can see.`,
    `Lead with faster payouts and a checkout that replaces ${provider} — frame it around reclaiming time and cutting fees.`,
    `Expect "switching sounds disruptive." Have a simple migration story and a quick cost comparison ready.`,
  ];
}

// Returns { turns:[{speaker,text}], text } — helpdesk turns are the ones voiced.
function buildTranscript(prospect) {
  const answers = deskAnswers(prospect);
  const firstName = (prospect.owner_name || "the owner").split(" ")[0];

  const turns = [
    { speaker: DESK, text: `Handshake lead desk — you're asking about ${prospect.business_name}. What do you need?` },
  ];

  REP_QUESTIONS.forEach((q, i) => {
    turns.push({ speaker: REP, text: q });
    turns.push({ speaker: DESK, text: answers[i] });
  });

  turns.push({ speaker: REP, text: "Perfect, that's what I needed." });
  turns.push({
    speaker: DESK,
    text: `Good luck — open by asking ${firstName} what payment headaches cost them most. You've got this.`,
  });

  const text = turns.map((t) => `${t.speaker}: ${t.text}`).join("\n");
  return { turns, text };
}

module.exports = {
  REP,
  DESK,
  REP_QUESTIONS,
  buildTranscript,
};
