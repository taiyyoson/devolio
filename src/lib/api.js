import { allowRequest } from "@/lib/rate-limit";
import { isValidSlug } from "@/lib/blog";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const LIMITS = {
  title: 200,
  description: 5000,
  position: 10000,
  summary: 500,
  content: 200_000,
  tag: 40,
  tagCount: 10,
};

export function fail(status, message) {
  return Response.json({ error: message }, { status });
}

/**
 * There is no identity provider right now — Supabase was removed and GitHub
 * OAuth has not landed yet. Both gates deny unconditionally rather than
 * degrading to "allow", so publishing is closed until auth is rebuilt.
 *
 * `allowRequest` stays imported because the shape of these functions is what
 * the OAuth implementation slots into: resolve a session, key the rate limiter
 * on a stable user id, return { user } or { error }.
 */
export async function authenticate() {
  return { error: fail(503, "Authentication is not configured") };
}

export async function isOwner() {
  return false;
}

export async function readJson(request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return null;
    return body;
  } catch {
    return null;
  }
}

/**
 * Log the real error but return a generic message — upstream messages can carry
 * repo paths and internal detail.
 */
export function dbError(context, error) {
  console.error(`[api] ${context}:`, error.message);
  return fail(500, "Request failed");
}

export function isUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function isBoundedString(value, max) {
  return typeof value === "string" && value.length <= max;
}

function isPosition(value) {
  return Number.isInteger(value) && value >= 0 && value <= LIMITS.position;
}

const FIELD_VALIDATORS = {
  title: (v) => isBoundedString(v, LIMITS.title) && v.trim().length > 0,
  description: (v) => isBoundedString(v, LIMITS.description),
  position: isPosition,
  column_id: isUuid,
  board_id: isUuid,
  id: isUuid,
  slug: isValidSlug,
  summary: (v) => isBoundedString(v, LIMITS.summary),
  content: (v) => isBoundedString(v, LIMITS.content) && v.trim().length > 0,
  tags: (v) =>
    Array.isArray(v) &&
    v.length <= LIMITS.tagCount &&
    v.every((t) => isBoundedString(t, LIMITS.tag) && /^[\w -]+$/.test(t)),
  draft: (v) => typeof v === "boolean",
  overwrite: (v) => typeof v === "boolean",
  // Shape first, then parse. Date.parse alone is not a validator: V8 accepts a
  // trailing parenthesized comment and ignores its contents, newlines included.
  date: (v) =>
    typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)),
};

/**
 * Validate a request body against an explicit field allowlist.
 *
 * `required` and `optional` name the only fields that may reach the database —
 * spreading the raw body into an update would let a caller write any column,
 * including id and created_at.
 */
export function pick(body, { required = [], optional = [] }) {
  const out = {};

  for (const field of required) {
    const value = body[field];
    if (value === undefined) return { error: fail(400, `Missing field: ${field}`) };
    if (!FIELD_VALIDATORS[field](value)) {
      return { error: fail(400, `Invalid field: ${field}`) };
    }
    out[field] = value;
  }

  for (const field of optional) {
    const value = body[field];
    if (value === undefined) continue;
    if (!FIELD_VALIDATORS[field](value)) {
      return { error: fail(400, `Invalid field: ${field}`) };
    }
    out[field] = value;
  }

  return { value: out };
}
