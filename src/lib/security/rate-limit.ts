/** Rate limit window configuration. */
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

/** Rate limit check result. */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface ClientWindow {
  count: number;
  resetAt: number;
}

/** Per-route rate limit presets. */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  plan: { windowMs: 60_000, maxRequests: 5 },
  refine: { windowMs: 60_000, maxRequests: 10 },
  vendors: { windowMs: 60_000, maxRequests: 10 },
  patch: { windowMs: 60_000, maxRequests: 30 },
  read: { windowMs: 60_000, maxRequests: 120 },
  ics: { windowMs: 60_000, maxRequests: 60 },
};

/** Global AI request ceiling per instance. */
export const AI_CEILING: RateLimitConfig = {
  windowMs: 60_000,
  maxRequests: 120,
};

const scale = parseFloat(process.env.RATE_LIMIT_SCALE ?? "1");
const clients = new Map<string, ClientWindow>();
const aiWindow: ClientWindow = { count: 0, resetAt: 0 };

/** Checks per-client rate limit for a route. */
export function checkClientLimit(
  clientKey: string,
  route: string,
  now: number = Date.now()
): RateLimitResult {
  const config = RATE_LIMITS[route];
  if (!config) {
    return { allowed: true, remaining: Infinity, retryAfterSeconds: 0 };
  }

  const scaledMax = Math.max(1, Math.round(config.maxRequests * scale));
  const key = `${clientKey}:${route}`;
  let window = clients.get(key);

  if (!window || now >= window.resetAt) {
    window = { count: 0, resetAt: now + config.windowMs };
    clients.set(key, window);
  }

  if (window.count >= scaledMax) {
    const retryAfter = Math.ceil((window.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
  }

  window.count++;
  return {
    allowed: true,
    remaining: scaledMax - window.count,
    retryAfterSeconds: 0,
  };
}

/** Checks global AI request ceiling. */
export function checkAiCeiling(now: number = Date.now()): RateLimitResult {
  const scaledMax = Math.max(1, Math.round(AI_CEILING.maxRequests * scale));

  if (now >= aiWindow.resetAt) {
    aiWindow.count = 0;
    aiWindow.resetAt = now + AI_CEILING.windowMs;
  }

  if (aiWindow.count >= scaledMax) {
    const retryAfter = Math.ceil((aiWindow.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: retryAfter };
  }

  aiWindow.count++;
  return {
    allowed: true,
    remaining: scaledMax - aiWindow.count,
    retryAfterSeconds: 0,
  };
}

/** Resets all rate limit state (for testing). */
export function resetRateLimits(): void {
  clients.clear();
  aiWindow.count = 0;
  aiWindow.resetAt = 0;
}
