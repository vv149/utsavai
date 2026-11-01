import { extractClientIp } from "@/lib/security/ip";
import { checkClientLimit } from "@/lib/security/rate-limit";
import { validateOrigin, getExpectedHost } from "@/lib/security/origin";
import { errorResponse } from "./http";

/** Applies rate limiting for a route. Returns error Response if limited, null if OK. */
export function applyRateLimit(
  request: Request,
  route: string
): Response | null {
  const clientIp = extractClientIp(request.headers);
  const result = checkClientLimit(clientIp, route);

  if (!result.allowed) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSeconds),
      },
    });
  }

  return null;
}

/** Validates origin for state-changing requests. Returns error Response if invalid. */
export function applyOriginCheck(request: Request): Response | null {
  const expectedHost = getExpectedHost(request.headers);
  if (!validateOrigin(request.headers, expectedHost)) {
    return errorResponse(403, "Origin mismatch");
  }
  return null;
}
