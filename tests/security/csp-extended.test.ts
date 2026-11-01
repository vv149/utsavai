import { describe, it, expect } from "vitest";
import { generateNonce, buildCspHeader, buildApiCspHeader, securityHeaders } from "@/lib/security/csp";

describe("generateNonce extended", () => {
  it("generates unique nonces", () => {
    const nonces = new Set(Array.from({ length: 100 }, () => generateNonce().value));
    expect(nonces.size).toBe(100);
  });

  it("nonce value is base64", () => {
    for (let i = 0; i < 10; i++) {
      const { value } = generateNonce();
      expect(value).toMatch(/^[A-Za-z0-9+/=]+$/);
    }
  });

  it("attribute includes nonce= with quotes", () => {
    const { attribute } = generateNonce();
    expect(attribute).toMatch(/^nonce="/);
  });

  it("nonce length is consistent", () => {
    const lengths = Array.from({ length: 20 }, () => generateNonce().value.length);
    expect(new Set(lengths).size).toBe(1);
  });
});

describe("buildCspHeader extended", () => {
  it("contains script-src with nonce", () => {
    const csp = buildCspHeader("test-nonce", false);
    expect(csp).toContain("script-src");
    expect(csp).toContain("test-nonce");
  });

  it("no unsafe-inline in prod", () => {
    const csp = buildCspHeader("n", false);
    expect(csp).not.toContain("'unsafe-inline'");
  });

  it("contains default-src", () => {
    const csp = buildCspHeader("n", false);
    expect(csp).toContain("default-src");
  });

  it("contains style-src", () => {
    const csp = buildCspHeader("n", false);
    expect(csp).toContain("style-src");
  });

  it("dev mode differs from prod", () => {
    const prod = buildCspHeader("n", false);
    const dev = buildCspHeader("n", true);
    expect(prod).not.toBe(dev);
  });
});

describe("buildApiCspHeader extended", () => {
  it("is restrictive", () => {
    const csp = buildApiCspHeader();
    expect(csp).toContain("default-src 'none'");
  });

  it("no script-src", () => {
    const csp = buildApiCspHeader();
    expect(csp).not.toContain("script-src");
  });
});

describe("securityHeaders extended", () => {
  it("returns all required headers", () => {
    const headers = securityHeaders("n", false);
    const headerNames = Object.keys(headers).map((k) => k.toLowerCase());
    expect(headerNames).toContain("strict-transport-security");
    expect(headerNames).toContain("x-content-type-options");
    expect(headerNames).toContain("x-frame-options");
    expect(headerNames).toContain("content-security-policy");
  });

  it("HSTS max-age is 2 years (63072000)", () => {
    const headers = securityHeaders("n", false);
    const hsts = Object.entries(headers).find(([k]) => k.toLowerCase() === "strict-transport-security");
    expect(hsts?.[1]).toContain("63072000");
  });

  it("X-Frame-Options is DENY", () => {
    const headers = securityHeaders("n", false);
    const xfo = Object.entries(headers).find(([k]) => k.toLowerCase() === "x-frame-options");
    expect(xfo?.[1]).toBe("DENY");
  });

  it("nosniff is set", () => {
    const headers = securityHeaders("n", false);
    const ct = Object.entries(headers).find(([k]) => k.toLowerCase() === "x-content-type-options");
    expect(ct?.[1]).toBe("nosniff");
  });

  it("referrer policy is strict", () => {
    const headers = securityHeaders("n", false);
    const rp = Object.entries(headers).find(([k]) => k.toLowerCase() === "referrer-policy");
    expect(rp?.[1]).toContain("strict-origin");
  });

  it("permissions-policy blocks features", () => {
    const headers = securityHeaders("n", false);
    const pp = Object.entries(headers).find(([k]) => k.toLowerCase() === "permissions-policy");
    expect(pp?.[1]).toContain("camera=()");
    expect(pp?.[1]).toContain("microphone=()");
  });
});
