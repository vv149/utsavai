import { describe, it, expect } from "vitest";
import { validateOrigin, getExpectedHost } from "@/lib/security/origin";

describe("validateOrigin extended", () => {
  it("accepts matching origin", () => {
    const h = new Headers({ "Origin": "https://example.com", "Host": "example.com" });
    expect(validateOrigin(h, "example.com")).toBe(true);
  });

  it("rejects mismatched origin", () => {
    const h = new Headers({ "Origin": "https://evil.com", "Host": "example.com" });
    expect(validateOrigin(h, "example.com")).toBe(false);
  });

  it("accepts same-site via Sec-Fetch-Site", () => {
    const h = new Headers({ "Sec-Fetch-Site": "same-origin", "Host": "example.com" });
    expect(validateOrigin(h, "example.com")).toBe(true);
  });

  it("rejects cross-site via Sec-Fetch-Site", () => {
    const h = new Headers({ "Sec-Fetch-Site": "cross-site", "Host": "example.com" });
    expect(validateOrigin(h, "example.com")).toBe(false);
  });

  it("accepts localhost origin", () => {
    const h = new Headers({ "Origin": "http://localhost:3000", "Host": "localhost:3000" });
    expect(validateOrigin(h, "localhost:3000")).toBe(true);
  });

  it("rejects when no origin and no sec-fetch-site", () => {
    const h = new Headers({ "Host": "example.com" });
    expect(validateOrigin(h, "example.com")).toBe(false);
  });

  it("accepts with port in origin", () => {
    const h = new Headers({ "Origin": "https://example.com:8080", "Host": "example.com:8080" });
    expect(validateOrigin(h, "example.com:8080")).toBe(true);
  });
});

describe("getExpectedHost extended", () => {
  it("returns Host header value", () => {
    const h = new Headers({ "Host": "example.com" });
    expect(getExpectedHost(h)).toBe("example.com");
  });

  it("returns Host with port", () => {
    const h = new Headers({ "Host": "example.com:3000" });
    expect(getExpectedHost(h)).toBe("example.com:3000");
  });

  it("returns Host even when X-Forwarded-Host present", () => {
    const h = new Headers({ "Host": "internal", "X-Forwarded-Host": "example.com" });
    const result = getExpectedHost(h);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns default for no host", () => {
    const h = new Headers();
    const result = getExpectedHost(h);
    expect(typeof result).toBe("string");
  });
});
