import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

// Used to save free-form rep notes into lead memory.
export async function POST(req) {
  const body = await req.json();
  if (!body.prospect_id || !body.note) {
    return NextResponse.json(
      { error: "prospect_id and note are required" },
      { status: 400 }
    );
  }
  const interaction = db.createInteraction({
    prospect_id: body.prospect_id,
    interaction_type: "Note",
    ai_summary: body.note,
  });
  return NextResponse.json({ interaction });
}
