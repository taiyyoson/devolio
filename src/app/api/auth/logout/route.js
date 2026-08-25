import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// POST only. A GET logout is CSRF-able and, worse, prefetchable by link scanners.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}
