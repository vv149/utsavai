import { describe, it, expect } from "vitest";
import { generateEditKey, hashEditKey, verifyEditKey } from "@/lib/security/edit-key";

describe("generateEditKey", () => {
  it("returns key and hash", () => {
    const { key, hash } = generateEditKey();
    expect(key).toBeTruthy();
    expect(hash).toBeTruthy();
  });

  it("key is base64url encoded", () => {
    const { key } = generateEditKey();
    expect(/^[A-Za-z0-9_-]+$/.test(key)).toBe(true);
  });

  it("hash is 64 hex chars (sha256)", () => {
    const { hash } = generateEditKey();
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
  });

  it("generates unique keys", () => {
    const a = generateEditKey();
    const b = generateEditKey();
    expect(a.key).not.toBe(b.key);
    expect(a.hash).not.toBe(b.hash);
  });
});

describe("hashEditKey", () => {
  it("returns deterministic hash", () => {
    expect(hashEditKey("test")).toBe(hashEditKey("test"));
  });

  it("returns different hash for different input", () => {
    expect(hashEditKey("a")).not.toBe(hashEditKey("b"));
  });
});

describe("verifyEditKey", () => {
  it("verifies correct key", () => {
    const { key, hash } = generateEditKey();
    expect(verifyEditKey(key, hash)).toBe(true);
  });

  it("rejects wrong key", () => {
    const { hash } = generateEditKey();
    expect(verifyEditKey("wrong-key", hash)).toBe(false);
  });

  it("rejects wrong hash", () => {
    const { key } = generateEditKey();
    expect(verifyEditKey(key, "0".repeat(64))).toBe(false);
  });

  it("uses constant-time comparison", () => {
    const { key, hash } = generateEditKey();
    expect(verifyEditKey(key, hash)).toBe(true);
  });
});
