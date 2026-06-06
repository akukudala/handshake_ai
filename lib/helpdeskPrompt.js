// Builds the "Handshake Lead Desk" assistant persona + the specific lead's
// context for a live ElevenLabs Conversational AI session.
//
// The REP calls this helpdesk and asks about the lead; the assistant briefs them.
// We inject everything via session `overrides` so the dashboard agent can stay
// generic. `dynamicVariables` is also returned as a fallback for agents whose
// prompt uses {{placeholders}} instead of overrides.

function leadFacts(p) {
  return [
    `- Business: ${p.business_name}`,
    `- Owner / contact: ${p.owner_name}`,
    `- Industry: ${p.industry}`,
    `- Location: ${p.address} (${p.distance_miles} miles away)`,
    `- Current payment provider: ${p.current_provider}`,
    `- Estimated revenue: ${p.estimated_revenue}`,
    `- About: ${p.business_description}`,
    `- Likely pain points: ${(p.likely_pain_points || []).join("; ") || "unknown"}`,
    `- Match score: ${p.match_score}/100`,
    `- Current status: ${p.status}`,
  ].join("\n");
}

export function buildHelpdeskPrompt(prospect) {
  const facts = leadFacts(prospect);
  const firstName = (prospect.owner_name || "the owner").split(" ")[0];

  const systemPrompt = `You are the Handshake AI Lead Desk — an internal voice line that briefs
sales reps about their leads right before a meeting. A rep has called you to get up to
speed on ONE specific lead.

You sell payments and checkout solutions to local businesses. Help the rep understand
the lead, their likely pain points, what to pitch, objections to expect, and a strong
conversation starter.

Style: talk like a sharp, friendly colleague on a phone call. Keep answers short and
spoken — one or two sentences, then let them ask the next thing. Do NOT read long lists
unless asked. Never invent facts beyond the lead profile; if you don't know, say so and
suggest what to confirm in the meeting. Do not quote specific pricing.

THE LEAD THE REP IS ASKING ABOUT:
${facts}

If the rep opens vaguely (e.g. "what do I need to know?"), give a 2-sentence snapshot of
${prospect.business_name} and ${firstName}, then ask what they want to dig into.`;

  const firstMessage = `Hi, you've reached the Handshake lead desk. You're asking about ${prospect.business_name}, run by ${firstName} — what do you want to know before your meeting?`;

  const dynamicVariables = {
    business_name: prospect.business_name,
    owner_name: prospect.owner_name,
    industry: prospect.industry,
    current_provider: prospect.current_provider,
    pain_points: (prospect.likely_pain_points || []).join("; "),
    lead_context: facts,
  };

  return { systemPrompt, firstMessage, dynamicVariables };
}
