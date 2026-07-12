// In-memory sliding-window rate limiter. Tracks hit timestamps per key and
// prunes entries older than the window on every check. `now` is injectable
// for tests; defaults to `Date.now` in production.
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: {
  limit: number;
  windowMs: number;
  now?: () => number;
}) {
  const hits = new Map<string, number[]>();

  function check(key: string): boolean {
    const t = now();
    const windowStart = t - windowMs;
    const existing = (hits.get(key) ?? []).filter((ts) => ts > windowStart);

    if (existing.length >= limit) {
      hits.set(key, existing);
      return false;
    }

    existing.push(t);
    hits.set(key, existing);
    return true;
  }

  return { check };
}
