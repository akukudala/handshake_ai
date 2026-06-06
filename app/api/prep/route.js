import { NextResponse } from "next/server";
import db from "@/lib/db";
import { generateMeetingPrep } from "@/lib/llm";

export const dynamic = "force-dynamic";

// Generates the Meeting Prep Card from the prospect, appointment, history,
// rep notes, and latest transcript — then saves it to lead memory.
export async function POST(req) {
  const body = await req.json();
  const prospect = db.getProspect(body.prospect_id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }

  const appointments = db.getAppointmentsForProspect(prospect.prospect_id);
  const history = db.getInteractionsForProspect(prospect.prospect_id);

  const { prep, source } = await generateMeetingPrep({
    prospect,
    appointment: appointments[appointments.length - 1] || null,
    history,
    repNotes: body.rep_notes || "",
    transcript: body.transcript || "",
  });

  const interaction = db.createInteraction({
    prospect_id: prospect.prospect_id,
    interaction_type: "Prep Summary",
    transcript: body.transcript || null,
    ai_summary: prep.business_summary,
    pain_points: Array.isArray(prep.key_pain_points)
      ? prep.key_pain_points.join("; ")
      : prep.key_pain_points,
    conversation_starters: prep.conversation_starter,
    recommended_pitch: prep.recommended_pitch,
    next_best_action: prep.next_best_action,
    extra: { prep, generated_by: source, rep_notes: body.rep_notes || "" },
  });

  return NextResponse.json({ prep, source, interaction });
}
