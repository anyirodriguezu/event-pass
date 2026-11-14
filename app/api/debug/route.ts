import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    return NextResponse.json({ ok: true, users: allUsers });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
