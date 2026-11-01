import { describe, it, expect, beforeEach } from "vitest";
import { checkClientLimit, checkAiCeiling, resetRateLimits } from "@/lib/security/rate-limit";

describe("checkClientLimit extended", () => {
  beforeEach(() => resetRateLimits());

  it("allows first request for plan", () => {
    expect(checkClientLimit("1.2.3.4", "plan").allowed).toBe(true);
  });

  it("allows first request for refine", () => {
    expect(checkClientLimit("1.2.3.4", "refine").allowed).toBe(true);
  });

  it("allows first request for vendors", () => {
    expect(checkClientLimit("1.2.3.4", "vendors").allowed).toBe(true);
  });

  it("allows first request for patch", () => {
    expect(checkClientLimit("1.2.3.4", "patch").allowed).toBe(true);
  });

  it("allows first request for ics", () => {
    expect(checkClientLimit("1.2.3.4", "ics").allowed).toBe(true);
  });

  it("different IPs have independent limits", () => {
    for (let i = 0; i < 5; i++) {
      checkClientLimit("1.1.1.1", "plan");
    }
    expect(checkClientLimit("1.1.1.1", "plan").allowed).toBe(false);
    expect(checkClientLimit("2.2.2.2", "plan").allowed).toBe(true);
  });

  it("refine limit is 10/min", () => {
    for (let i = 0; i < 10; i++) {
      expect(checkClientLimit("1.2.3.4", "refine").allowed).toBe(true);
    }
    expect(checkClientLimit("1.2.3.4", "refine").allowed).toBe(false);
  });

  it("vendors limit is 10/min", () => {
    for (let i = 0; i < 10; i++) {
      expect(checkClientLimit("1.2.3.4", "vendors").allowed).toBe(true);
    }
    expect(checkClientLimit("1.2.3.4", "vendors").allowed).toBe(false);
  });

  it("retryAfterSeconds is positive when limited", () => {
    for (let i = 0; i < 6; i++) {
      checkClientLimit("1.2.3.4", "plan");
    }
    const result = checkClientLimit("1.2.3.4", "plan");
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });
});

describe("checkAiCeiling extended", () => {
  beforeEach(() => resetRateLimits());

  it("allows first 120 requests", () => {
    for (let i = 0; i < 120; i++) {
      expect(checkAiCeiling().allowed).toBe(true);
    }
  });

  it("blocks at 121", () => {
    for (let i = 0; i < 120; i++) {
      checkAiCeiling();
    }
    expect(checkAiCeiling().allowed).toBe(false);
  });

  it("retryAfterSeconds on ceiling hit", () => {
    for (let i = 0; i < 121; i++) {
      checkAiCeiling();
    }
    expect(checkAiCeiling().retryAfterSeconds).toBeGreaterThan(0);
  });
});
