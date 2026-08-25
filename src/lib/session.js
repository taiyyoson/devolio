import "server-only";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "devolio_session";
export const STATE_COOKIE = "devolio_oauth_state";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60;
const MIN_SECRET_LENGTH = 32;

export class AuthConfigError extends Error {}

/**
 * Read env at call time, not module scope — a missing secret should surface as a
 * handled 503 on the request that needs it, not break the build.
 */
export function authConfig() {
  const secret = process.env.AUTH_SECRET;
  const owner = process.env.GITHUB_OWNER?.trim();
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();

  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new AuthConfigError(`AUTH_SECRET must be set and at least ${MIN_SECRET_LENGTH} characters`);
  }
  if (!owner) throw new AuthConfigError("GITHUB_OWNER must be set");
  if (!clientId || !clientSecret) {
    throw new AuthConfigError("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set");
  }

  return { secret, owner, clientId, clientSecret };
}

export function isAuthConfigured() {
  try {
    authConfig();
    return true;
  } catch {
    return false;
  }
}

let keyPromise = null;
let keyForSecret = null;

async function getKey() {
  const { secret } = authConfig();
  if (!keyPromise || keyForSecret !== secret) {
    keyForSecret = secret;
    keyPromise = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  return keyPromise;
}

const b64 = (buf) => Buffer.from(buf).toString("base64url");

export function randomToken(bytes = 32) {
  return b64(crypto.getRandomValues(new Uint8Array(bytes)));
}

/**
 * Compare via HMAC rather than string equality so the comparison is constant
 * time. crypto.subtle.verify does the compare internally.
 */
export async function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const key = await getKey();
  const enc = new TextEncoder();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(a));
  return crypto.subtle.verify("HMAC", key, sig, enc.encode(b));
}

export function isOwnerLogin(login) {
  const { owner } = authConfig();
  return typeof login === "string" && login.toLowerCase() === owner.toLowerCase();
}

export async function signSession({ sub, login }) {
  const key = await getKey();
  const now = Math.floor(Date.now() / 1000);
  const payload = b64(
    JSON.stringify({ v: 1, sub: String(sub), login, iat: now, exp: now + SESSION_MAX_AGE })
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${b64(sig)}`;
}

/**
 * Never throws — every failure returns null.
 *
 * The signature is verified against the raw payload string BEFORE decoding it.
 * Buffer's base64url decoder is lenient (it drops invalid characters rather than
 * throwing), so verifying post-decode would let a mutated token authenticate.
 */
export async function verifySession(token) {
  try {
    if (typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payload, sig] = parts;
    const key = await getKey();
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      Buffer.from(sig, "base64url"),
      new TextEncoder().encode(payload)
    );
    if (!ok) return null;

    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    if (data.v !== 1) return null;
    if (typeof data.exp !== "number" || data.exp <= Math.floor(Date.now() / 1000)) return null;
    if (!isOwnerLogin(data.login)) return null;

    return { sub: String(data.sub), login: data.login };
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Must be "lax": the cookie is set on a response to a top-level navigation
    // coming from github.com. "strict" would drop it and login would never work.
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

export function stateCookieOptions(maxAge = 600) {
  return { ...sessionCookieOptions(maxAge), path: "/api/auth" };
}

/**
 * maxAge is advisory — the client controls cookie lifetime — so expiry is
 * enforced from the signed `exp` inside verifySession.
 */
export async function getSession() {
  try {
    const store = await cookies();
    return await verifySession(store.get(SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}
