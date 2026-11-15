import { draftMode } from "next/headers";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

export async function GET(req: NextRequest) {
  (await draftMode()).disable();
  const back = req.nextUrl.searchParams.get("back") ?? "/";
  redirect(back);
}
