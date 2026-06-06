import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    rep: db.getRep(),
    prospects: db.getProspects(),
  });
}
