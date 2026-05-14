type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export function checkRateLimit({ key, limit, windowMs }: RateLimitOptions) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: Math.max(limit - 1, 0), resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { limited: true, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { limited: false, remaining: Math.max(limit - bucket.count, 0), resetAt: bucket.resetAt };
}

export function rateLimitResponse(resetAt: number) {
  return {
    body: { error: "Te veel aanvragen. Probeer het later opnieuw." },
    init: {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))),
      },
    },
  };
}
