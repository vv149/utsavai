import { describe, it, expect, vi, beforeEach } from "vitest";
import { applyRateLimit, applyOriginCheck } from "@/lib/server/middleware";
import { resetRateLimits } from "@/lib/security/rate-limit";

function makeRequest(url = "http://localhost:3000/api/plan", headers: Record<string, string> = {}): Request {
  const h = new Headers({ "Host": "localhost:3000", "Origin": "http://localhost:3000", ...headers });
  return new Request(url, { headers: h });
}

describe("applyRateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("returns null when under limit", () => {
    expect(applyRateLimit(makeRequest(), "read")).toBeNull();
  });

  it("returns 429 response when over limit", () => {
    for (let i = 0; i < 120; i++) {
      applyRateLimit(makeRequest(), "read");
    }
    const result = applyRateLimit(makeRequest(), "read");
    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);
  });

  it("429 includes Retry-After header", async () => {
    for (let i = 0; i < 120; i++) {
      applyRateLimit(makeRequest(), "read");
    }
    const result = applyRateLimit(makeRequest(), "read");
    expect(result!.headers.get("Retry-After")).toBeTruthy();
  });

  it("429 body is JSON with error", async () => {
    for (let i = 0; i < 120; i++) {
      applyRateLimit(makeRequest(), "read");
    }
    const result = applyRateLimit(makeRequest(), "read");
    const body = await result!.json();
    expect(body.error).toBe("Too many requests");
  });

  it("different routes have independent limits", () => {
    for (let i = 0; i < 5; i++) {
      applyRateLimit(makeRequest(), "plan");
    }
    const planResult = applyRateLimit(makeRequest(), "plan");
    expect(planResult).not.toBeNull();
    expect(applyRateLimit(makeRequest(), "read")).toBeNull();
  });

  it("plan route has low limit (5/min)", () => {
    for (let i = 0; i < 5; i++) {
      expect(applyRateLimit(makeRequest(), "plan")).toBeNull();
    }
    expect(applyRateLimit(makeRequest(), "plan")).not.toBeNull();
  });
});

describe("applyOriginCheck", () => {
  it("returns null for valid origin", () => {
    expect(applyOriginCheck(makeRequest())).toBeNull();
  });

  it("returns 403 for mismatched origin", () => {
    const result = applyOriginCheck(makeRequest("http://localhost:3000/api/plan", {
      "Host": "localhost:3000",
      "Origin": "http://evil.com",
    }));
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("403 body contains origin mismatch", async () => {
    const result = applyOriginCheck(makeRequest("http://localhost:3000/api/plan", {
      "Host": "localhost:3000",
      "Origin": "http://evil.com",
    }));
    const body = await result!.json();
    expect(body.error).toBe("Origin mismatch");
  });
});
