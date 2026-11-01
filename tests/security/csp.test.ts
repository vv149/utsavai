import { describe, it, expect } from "vitest";
import { generateNonce, buildCspHeader, buildApiCspHeader, securityHeaders } from "@/lib/security/csp";

describe("generateNonce", () => {
  it("returns a value and attribute", () => {
    const nonce = generateNonce();
    expect(nonce.value).toBeTruthy();
    expect(nonce.attribute).toContain("nonce=");
  });

  it("generates unique nonces", () => {
    const a = generateNonce();
    const b = generateNonce();
    expect(a.value).not.toBe(b.value);
  });

  it("value is base64", () => {
    const nonce = generateNonce();
    expect(() => Buffer.from(nonce.value, "base64")).not.toThrow();
  });

  it("attribute wraps value in quotes", () => {
    const nonce = generateNonce();
    expect(nonce.attribute).toBe(`nonce="${nonce.value}"`);
  });

  it("value is 24 chars (16 bytes base64)", () => {
    const nonce = generateNonce();
    expect(nonce.value.length).toBe(24);
  });
});

describe("buildCspHeader", () => {
  it("includes nonce in prod", () => {
    const csp = buildCspHeader("test-nonce", false);
    expect(csp).toContain("nonce-test-nonce");
  });

  it("no unsafe-inline for scripts in prod", () => {
    const csp = buildCspHeader("nonce", false);
    expect(csp).not.toContain("unsafe-inline");
  });

  it("includes unsafe-inline for styles in dev", () => {
    const csp = buildCspHeader("nonce", true);
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  it("includes strict-dynamic in prod", () => {
    const csp = buildCspHeader("nonce", false);
    expect(csp).toContain("strict-dynamic");
  });

  it("blocks object-src", () => {
    const csp = buildCspHeader("nonce", false);
    expect(csp).toContain("object-src 'none'");
  });

  it("blocks frame-ancestors", () => {
    const csp = buildCspHeader("nonce", false);
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("includes upgrade-insecure in prod", () => {
    const csp = buildCspHeader("nonce", false);
    expect(csp).toContain("upgrade-insecure-requests");
  });

  it("no upgrade-insecure in dev", () => {
    const csp = buildCspHeader("nonce", true);
    expect(csp).not.toContain("upgrade-insecure-requests");
  });

  it("has base-uri self", () => {
    const csp = buildCspHeader("nonce", false);
    expect(csp).toContain("base-uri 'self'");
  });

  it("has form-action self", () => {
    const csp = buildCspHeader("nonce", false);
    expect(csp).toContain("form-action 'self'");
  });
});

describe("buildApiCspHeader", () => {
  it("denies all", () => {
    expect(buildApiCspHeader()).toBe("default-src 'none'");
  });
});

describe("securityHeaders", () => {
  it("includes CSP", () => {
    const headers = securityHeaders("nonce", false);
    expect(headers["Content-Security-Policy"]).toBeTruthy();
  });

  it("includes HSTS with 2-year max-age", () => {
    const headers = securityHeaders("nonce", false);
    expect(headers["Strict-Transport-Security"]).toContain("max-age=63072000");
  });

  it("includes nosniff", () => {
    const headers = securityHeaders("nonce", false);
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
  });

  it("includes X-Frame-Options DENY", () => {
    const headers = securityHeaders("nonce", false);
    expect(headers["X-Frame-Options"]).toBe("DENY");
  });

  it("includes strict referrer", () => {
    const headers = securityHeaders("nonce", false);
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
  });

  it("includes COOP same-origin", () => {
    const headers = securityHeaders("nonce", false);
    expect(headers["Cross-Origin-Opener-Policy"]).toBe("same-origin");
  });

  it("includes CORP same-origin", () => {
    const headers = securityHeaders("nonce", false);
    expect(headers["Cross-Origin-Resource-Policy"]).toBe("same-origin");
  });

  it("includes COEP require-corp", () => {
    const headers = securityHeaders("nonce", false);
    expect(headers["Cross-Origin-Embedder-Policy"]).toBe("require-corp");
  });

  it("denies camera in permissions policy", () => {
    const headers = securityHeaders("nonce", false);
    expect(headers["Permissions-Policy"]).toContain("camera=()");
  });

  it("denies microphone in permissions policy", () => {
    const headers = securityHeaders("nonce", false);
    expect(headers["Permissions-Policy"]).toContain("microphone=()");
  });

  it("denies geolocation in permissions policy", () => {
    const headers = securityHeaders("nonce", false);
    expect(headers["Permissions-Policy"]).toContain("geolocation=()");
  });
});
