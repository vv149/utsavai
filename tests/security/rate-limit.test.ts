import { describe, it, expect, beforeEach } from "vitest";
import {
  checkClientLimit,
  checkAiCeiling,
  resetRateLimits,
  RATE_LIMITS,
  AI_CEILING,
} from "@/lib/security/rate-limit";

beforeEach(() => {
  resetRateLimits();
});

describe("checkClientLimit", () => {
  it("allows first request", () => {
    const result = checkClientLimit("1.2.3.4", "plan");
    expect(result.allowed).toBe(true);
  });

  it("counts remaining correctly", () => {
    const result = checkClientLimit("1.2.3.4", "plan");
    expect(result.remaining).toBe(RATE_LIMITS.plan.maxRequests - 1);
  });

  it("blocks after exceeding limit", () => {
    for (let i = 0; i < RATE_LIMITS.plan.maxRequests; i++) {
      checkClientLimit("1.2.3.4", "plan");
    }
    const result = checkClientLimit("1.2.3.4", "plan");
    expect(result.allowed).toBe(false);
  });

  it("provides retry-after when blocked", () => {
    for (let i = 0; i < RATE_LIMITS.plan.maxRequests; i++) {
      checkClientLimit("1.2.3.4", "plan");
    }
    const result = checkClientLimit("1.2.3.4", "plan");
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("allows after window resets", () => {
    const now = 1000;
    for (let i = 0; i < RATE_LIMITS.plan.maxRequests; i++) {
      checkClientLimit("1.2.3.4", "plan", now);
    }
    const result = checkClientLimit("1.2.3.4", "plan", now + 61_000);
    expect(result.allowed).toBe(true);
  });

  it("tracks clients separately", () => {
    for (let i = 0; i < RATE_LIMITS.plan.maxRequests; i++) {
      checkClientLimit("1.2.3.4", "plan");
    }
    const result = checkClientLimit("5.6.7.8", "plan");
    expect(result.allowed).toBe(true);
  });

  it("tracks routes separately", () => {
    for (let i = 0; i < RATE_LIMITS.plan.maxRequests; i++) {
      checkClientLimit("1.2.3.4", "plan");
    }
    const result = checkClientLimit("1.2.3.4", "read");
    expect(result.allowed).toBe(true);
  });

  it("returns allowed for unknown route", () => {
    const result = checkClientLimit("1.2.3.4", "nonexistent");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(Infinity);
  });

  it("read route allows 120 requests", () => {
    for (let i = 0; i < 120; i++) {
      const r = checkClientLimit("1.2.3.4", "read");
      expect(r.allowed).toBe(true);
    }
    const blocked = checkClientLimit("1.2.3.4", "read");
    expect(blocked.allowed).toBe(false);
  });
});

describe("checkAiCeiling", () => {
  it("allows first request", () => {
    const result = checkAiCeiling();
    expect(result.allowed).toBe(true);
  });

  it("blocks after ceiling hit", () => {
    for (let i = 0; i < AI_CEILING.maxRequests; i++) {
      checkAiCeiling();
    }
    const result = checkAiCeiling();
    expect(result.allowed).toBe(false);
  });

  it("resets after window", () => {
    const now = 1000;
    for (let i = 0; i < AI_CEILING.maxRequests; i++) {
      checkAiCeiling(now);
    }
    const result = checkAiCeiling(now + 61_000);
    expect(result.allowed).toBe(true);
  });

  it("counts remaining", () => {
    const result = checkAiCeiling();
    expect(result.remaining).toBe(AI_CEILING.maxRequests - 1);
  });
});

describe("resetRateLimits", () => {
  it("clears all state", () => {
    for (let i = 0; i < RATE_LIMITS.plan.maxRequests; i++) {
      checkClientLimit("1.2.3.4", "plan");
    }
    resetRateLimits();
    const result = checkClientLimit("1.2.3.4", "plan");
    expect(result.allowed).toBe(true);
  });
});
