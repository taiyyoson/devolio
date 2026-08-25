import { NextResponse } from "next/server";
import { allowRequest } from "@/lib/rate-limit";
import {
  SESSION_COOKIE,
  STATE_COOKIE,
  authConfig,
  isAuthConfigured,
  isOwnerLogin,
  safeEqual,
  sessionCookieOptions,
  signSession,
} from "@/lib/session";

const TIMEOUT_MS = 10_000;

function finish(request, code) {
  const res = NextResponse.redirect(new URL(`/#login=${code}`, request.url), 303);
  res.cookies.set(STATE_COOKIE, "", { path: "/api/auth", maxAge: 0 });
  res.headers.set("Cache-Control", "no-store");
  return res;
}

async function exchangeCode(code, { clientId, clientSecret }) {
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`token exchange HTTP ${res.status}`);

  // GitHub answers a bad verification code with HTTP 200 and an error body, so
  // res.ok alone would accept a failed exchange.
  const body = await res.json();
  if (body.error) throw new Error(`token exchange: ${body.error}`);
  if (!body.access_token) throw new Error("token exchange returned no access_token");

  return body.access_token;
}

async function fetchUser(accessToken) {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!res.ok) throw new Error(`GET /user HTTP ${res.status}`);
  return res.json();
}

export async function GET(request) {
  if (!isAuthConfigured()) return finish(request, "not_configured");

  const ip = request.headers.get("x-forwarded-for") ?? "local";
  if (!allowRequest(`ip:${ip}`, { max: 20, windowMs: 60_000 })) {
    return finish(request, "rate_limited");
  }

  const params = request.nextUrl.searchParams;
  if (params.get("error")) return finish(request, "denied");

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) return finish(request, "invalid_request");

  const expected = request.cookies.get(STATE_COOKIE)?.value;
  if (!expected) return finish(request, "state_missing");
  if (!(await safeEqual(state, expected))) {
    console.warn("[auth] oauth state mismatch");
    return finish(request, "state_mismatch");
  }

  let user;
  try {
    const token = await exchangeCode(code, authConfig());
    user = await fetchUser(token);
  } catch (err) {
    console.error("[auth] callback:", err.message);
    return finish(request, "exchange_failed");
  }

  if (!isOwnerLogin(user?.login)) {
    console.warn("[auth] rejected login for", user?.login);
    return finish(request, "forbidden");
  }

  const res = finish(request, "ok");
  res.cookies.set(
    SESSION_COOKIE,
    await signSession({ sub: user.id, login: user.login }),
    sessionCookieOptions()
  );
  return res;
}
