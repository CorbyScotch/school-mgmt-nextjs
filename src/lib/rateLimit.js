const requestMap = new Map();

export function checkRateLimit(identifier, limit = 5, windowMs = 60 * 1000) {
  const now = Date.now();
  const entry = requestMap.get(identifier) || {
    count: 0,
    resetAt: now + windowMs,
  };

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  requestMap.set(identifier, entry);

  const allowed = entry.count <= limit;

  return {
    allowed,
    retryAfterMs: Math.max(0, entry.resetAt - now),
    remaining: Math.max(0, limit - entry.count),
  };
}
