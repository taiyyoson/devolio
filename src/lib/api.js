import { createClient } from "@/lib/supabase/server";
import { allowRequest } from "@/lib/rate-limit";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const LIMITS = {
  title: 200,
  description: 5000,
  position: 10000,
};

export function fail(status, message) {
  return Response.json({ error: message }, { status });
}

/**
 * Resolve the caller's Supabase client and user, or the error response to
 * return. Uses getUser(), which revalidates the JWT server-side; getSession()
 * would trust an unverified cookie.
 */
export async function authenticate() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: fail(401, "Unauthorized") };
  if (!allowRequest(user.id)) return { error: fail(429, "Too many requests") };

  return { supabase, user };
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
 * Log the real Supabase error but return a generic message — error.message can
 * carry table names, constraint names, and column details.
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
