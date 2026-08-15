const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;
const PRUNE_EVERY = 500;

const hits = new Map();
let callsSincePrune = 0;

function prune(now) {
  for (const [key, timestamps] of hits) {
    const live = timestamps.filter((t) => now - t < WINDOW_MS);
    if (live.length === 0) hits.delete(key);
    else hits.set(key, live);
  }
}

/**
 * Best-effort per-user request cap.
 *
 * State is per server instance, so a horizontally scaled deployment enforces
 * this per instance rather than globally. That is enough to blunt a runaway
 * client or a single abusive session; it is not a defense against a
 * distributed attacker. Move to a shared store (Upstash, Redis) if this ever
 * needs to be authoritative.
 */
export function allowRequest(key, { max = MAX_REQUESTS, windowMs = WINDOW_MS } = {}) {
  const now = Date.now();

  if (++callsSincePrune >= PRUNE_EVERY) {
    callsSincePrune = 0;
    prune(now);
  }

  const timestamps = (hits.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= max) {
    hits.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  hits.set(key, timestamps);
  return true;
}
