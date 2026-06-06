import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const prospect = db.getProspect(params.id);
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
  }
  return NextResponse.json({
    prospect,
    appointments: db.getAppointmentsForProspect(params.id),
    interactions: db.getInteractionsForProspect(params.id),
  });
}
