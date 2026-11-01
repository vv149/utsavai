import { describe, it, expect } from "vitest";
import { validateOrigin, getExpectedHost } from "@/lib/security/origin";

describe("validateOrigin", () => {
  it("accepts matching origin", () => {
    const headers = new Headers({ origin: "https://example.com" });
    expect(validateOrigin(headers, "example.com")).toBe(true);
  });

  it("rejects mismatched origin", () => {
    const headers = new Headers({ origin: "https://evil.com" });
    expect(validateOrigin(headers, "example.com")).toBe(false);
  });

  it("rejects malformed origin", () => {
    const headers = new Headers({ origin: "not-a-url" });
    expect(validateOrigin(headers, "example.com")).toBe(false);
  });

  it("falls back to sec-fetch-site when no origin", () => {
    const headers = new Headers({ "sec-fetch-site": "same-origin" });
    expect(validateOrigin(headers, "example.com")).toBe(true);
  });

  it("rejects cross-origin sec-fetch-site", () => {
    const headers = new Headers({ "sec-fetch-site": "cross-site" });
    expect(validateOrigin(headers, "example.com")).toBe(false);
  });

  it("rejects when no origin and no sec-fetch-site", () => {
    const headers = new Headers();
    expect(validateOrigin(headers, "example.com")).toBe(false);
  });

  it("handles port in origin", () => {
    const headers = new Headers({ origin: "http://localhost:3000" });
    expect(validateOrigin(headers, "localhost:3000")).toBe(true);
  });
});

describe("getExpectedHost", () => {
  it("returns host header", () => {
    const headers = new Headers({ host: "example.com" });
    expect(getExpectedHost(headers)).toBe("example.com");
  });

  it("defaults to localhost:3000", () => {
    const headers = new Headers();
    expect(getExpectedHost(headers)).toBe("localhost:3000");
  });
});
