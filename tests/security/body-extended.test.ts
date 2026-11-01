import { describe, it, expect } from "vitest";
import { readBodyWithCap, BodyValidationError, BYTE_CAPS } from "@/lib/security/body";

describe("BYTE_CAPS", () => {
  it("plan cap is 8KB", () => {
    expect(BYTE_CAPS.plan).toBe(8 * 1024);
  });

  it("patch cap is 16KB", () => {
    expect(BYTE_CAPS.patch).toBe(16 * 1024);
  });

  it("refine cap is 2KB", () => {
    expect(BYTE_CAPS.refine).toBe(2 * 1024);
  });

  it("vendors cap is 1KB", () => {
    expect(BYTE_CAPS.vendors).toBe(1 * 1024);
  });
});

describe("BodyValidationError", () => {
  it("has correct name", () => {
    const err = new BodyValidationError(400, "test");
    expect(err.name).toBe("BodyValidationError");
  });

  it("carries message", () => {
    const err = new BodyValidationError(413, "too large");
    expect(err.message).toBe("too large");
  });

  it("is instance of Error", () => {
    const err = new BodyValidationError(400, "test");
    expect(err instanceof Error).toBe(true);
  });

  it("is instance of BodyValidationError", () => {
    const err = new BodyValidationError(400, "test");
    expect(err instanceof BodyValidationError).toBe(true);
  });

  it("has status code", () => {
    const err = new BodyValidationError(413, "too big");
    expect(err.status).toBe(413);
  });
});

describe("readBodyWithCap", () => {
  it("reads valid JSON body as string", async () => {
    const body = JSON.stringify({ test: true });
    const request = new Request("http://localhost/api/plan", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
    const result = await readBodyWithCap(request, "plan");
    expect(typeof result).toBe("string");
    expect(JSON.parse(result)).toEqual({ test: true });
  });

  it("rejects non-JSON content type", async () => {
    const request = new Request("http://localhost/api/plan", {
      method: "POST",
      body: "text",
      headers: { "Content-Type": "text/plain" },
    });
    await expect(readBodyWithCap(request, "plan")).rejects.toThrow(BodyValidationError);
  });

  it("rejects oversized body", async () => {
    const large = JSON.stringify({ data: "x".repeat(10 * 1024) });
    const request = new Request("http://localhost/api/plan", {
      method: "POST",
      body: large,
      headers: { "Content-Type": "application/json" },
    });
    await expect(readBodyWithCap(request, "plan")).rejects.toThrow(BodyValidationError);
  });

  it("reads body within vendors cap", async () => {
    const body = JSON.stringify({ planId: "abc", category: "Venue" });
    const request = new Request("http://localhost/api/vendors", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
    const result = await readBodyWithCap(request, "vendors");
    expect(JSON.parse(result).planId).toBe("abc");
  });
});
