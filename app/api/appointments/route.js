import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const body = await req.json();
  if (!body.prospect_id || !body.appointment_date || !body.appointment_time) {
    return NextResponse.json(
      { error: "prospect_id, appointment_date and appointment_time are required" },
      { status: 400 }
    );
  }

  const appointment = db.createAppointment(body);

  // Also log the appointment as an interaction in lead memory.
  db.createInteraction({
    prospect_id: body.prospect_id,
    interaction_type: "Appointment",
    ai_summary: `Appointment ${appointment.appointment_status} for ${appointment.appointment_date} at ${appointment.appointment_time}.`,
    next_best_action: "Run an AI voice call before the meeting to prep.",
    extra: { appointment },
  });

  return NextResponse.json({ appointment });
}
