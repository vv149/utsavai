import { describe, it, expect } from "vitest";
import { readBodyWithCap, BodyValidationError, BYTE_CAPS } from "@/lib/security/body";

function makeRequest(body: string, contentType = "application/json"): Request {
  return new Request("http://localhost/api/test", {
    method: "POST",
    headers: { "content-type": contentType },
    body,
  });
}

describe("readBodyWithCap", () => {
  it("reads valid JSON body", async () => {
    const req = makeRequest('{"test": true}');
    const result = await readBodyWithCap(req, "plan");
    expect(result).toBe('{"test": true}');
  });

  it("rejects wrong content-type", async () => {
    const req = makeRequest("hello", "text/plain");
    await expect(readBodyWithCap(req, "plan")).rejects.toThrow(BodyValidationError);
  });

  it("rejects oversized body", async () => {
    const big = "x".repeat(BYTE_CAPS.plan + 1);
    const req = makeRequest(big);
    await expect(readBodyWithCap(req, "plan")).rejects.toThrow(BodyValidationError);
  });

  it("accepts body at exact cap", async () => {
    const exact = "x".repeat(BYTE_CAPS.vendors);
    const req = makeRequest(exact);
    const result = await readBodyWithCap(req, "vendors");
    expect(result).toBe(exact);
  });

  it("uses correct cap per route", () => {
    expect(BYTE_CAPS.plan).toBe(8 * 1024);
    expect(BYTE_CAPS.patch).toBe(16 * 1024);
    expect(BYTE_CAPS.refine).toBe(2 * 1024);
    expect(BYTE_CAPS.vendors).toBe(1 * 1024);
  });
});

describe("BodyValidationError", () => {
  it("has status and message", () => {
    const err = new BodyValidationError(413, "Too big");
    expect(err.status).toBe(413);
    expect(err.message).toBe("Too big");
  });

  it("has correct name", () => {
    const err = new BodyValidationError(400, "Bad");
    expect(err.name).toBe("BodyValidationError");
  });

  it("is an Error", () => {
    const err = new BodyValidationError(400, "Bad");
    expect(err).toBeInstanceOf(Error);
  });
});
