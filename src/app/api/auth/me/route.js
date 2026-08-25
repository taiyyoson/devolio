import { getSession } from "@/lib/session";

// Always 200, never 401 — the terminal calls this on every mount, including for
// anonymous visitors, and a 401 would put a red error in everyone's console.
export async function GET() {
  const session = await getSession();
  return Response.json(
    { authenticated: Boolean(session), login: session?.login ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
