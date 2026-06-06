import { NextResponse } from "next/server";
import db from "@/lib/db";
import { buildTranscript } from "@/lib/voiceScript";

export const dynamic = "force-dynamic";

// Records an AI voice call in lead memory.
//   - If `transcript` is supplied (real ElevenLabs Conversational AI call),
//     it is saved as-is.
//   - Otherwise the call is simulated and a scripted transcript is returned.
export async function POST(req) {
  const body = await req.json();
  const prospect = db.getProspect(body.prospect_id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const isLive = typeof body.transcript === "string" && body.transcript.trim();
  const turns = isLive ? body.turns || null : buildTranscript(prospect).turns;
  const text = isLive ? body.transcript : buildTranscript(prospect).text;

  const interaction = db.createInteraction({
    prospect_id: prospect.prospect_id,
    interaction_type: "Voice Call",
    transcript: text,
    ai_summary: isLive
      ? "Rep called the AI lead desk for a live briefing on this lead."
      : "Rep previewed a scripted lead-desk briefing.",
  });

  // Advance status: a New prospect becomes Called.
  if (prospect.status === "New") {
    db.updateProspectStatus(prospect.prospect_id, "Called");
  }

  return NextResponse.json({ turns, transcript: text, interaction, live: !!isLive });
}
