import { NextResponse } from "next/server";
import {
  STATE_COOKIE,
  authConfig,
  getSession,
  isAuthConfigured,
  randomToken,
  stateCookieOptions,
} from "@/lib/session";

/**
 * Failures redirect back into the terminal with a code rather than returning
 * JSON — this is a top-level navigation, so a raw error document would be a
 * dead end for the user.
 */
function backToTerminal(request, code) {
  const res = NextResponse.redirect(new URL(`/#login=${code}`, request.url), 303);
  res.headers.set("Cache-Control", "no-store");
  return res;
}

export async function GET(request) {
  if (!isAuthConfigured()) return backToTerminal(request, "not_configured");
  if (await getSession()) return backToTerminal(request, "already");

  const { clientId } = authConfig();
  const state = randomToken(32);

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("state", state);
  // No scope: GET /user returns login and id unauthenticated-of-scope, and this
  // token is only ever used to establish identity. Repo writes use GITHUB_TOKEN.
  authorize.searchParams.set("scope", "");
  authorize.searchParams.set("allow_signup", "false");

  // redirect_uri is deliberately omitted so GitHub uses the callback registered
  // on the OAuth App. Deriving it from the request would mean trusting the Host
  // header and inventing an open-redirect surface.
  const res = NextResponse.redirect(authorize, 303);
  res.cookies.set(STATE_COOKIE, state, stateCookieOptions());
  res.headers.set("Cache-Control", "no-store");
  return res;
}
