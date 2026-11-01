import { describe, it, expect } from "vitest";
import { generateEditKey, hashEditKey, verifyEditKey } from "@/lib/security/edit-key";

describe("generateEditKey extended", () => {
  it("returns different keys each time", () => {
    const keys = new Set(Array.from({ length: 50 }, () => generateEditKey().key));
    expect(keys.size).toBe(50);
  });

  it("returns different hashes each time", () => {
    const hashes = new Set(Array.from({ length: 50 }, () => generateEditKey().hash));
    expect(hashes.size).toBe(50);
  });

  it("key is base64url encoded", () => {
    for (let i = 0; i < 10; i++) {
      const { key } = generateEditKey();
      expect(key).toMatch(/^[A-Za-z0-9_-]+$/);
    }
  });

  it("hash is hex string", () => {
    for (let i = 0; i < 10; i++) {
      const { hash } = generateEditKey();
      expect(hash).toMatch(/^[a-f0-9]+$/);
    }
  });

  it("hash length is consistent (SHA-256 = 64 hex chars)", () => {
    for (let i = 0; i < 10; i++) {
      const { hash } = generateEditKey();
      expect(hash.length).toBe(64);
    }
  });
});

describe("hashEditKey extended", () => {
  it("same input produces same hash", () => {
    const key = "test-key-123";
    expect(hashEditKey(key)).toBe(hashEditKey(key));
  });

  it("different inputs produce different hashes", () => {
    expect(hashEditKey("key-a")).not.toBe(hashEditKey("key-b"));
  });

  it("hash is 64 hex chars", () => {
    expect(hashEditKey("any-key").length).toBe(64);
  });
});

describe("verifyEditKey extended", () => {
  it("correct key verifies", () => {
    const { key, hash } = generateEditKey();
    expect(verifyEditKey(key, hash)).toBe(true);
  });

  it("wrong key fails", () => {
    const { hash } = generateEditKey();
    expect(verifyEditKey("wrong-key", hash)).toBe(false);
  });

  it("similar key fails (off by one char)", () => {
    const { key, hash } = generateEditKey();
    const modified = key.slice(0, -1) + (key.endsWith("a") ? "b" : "a");
    expect(verifyEditKey(modified, hash)).toBe(false);
  });

  it("empty key fails", () => {
    const { hash } = generateEditKey();
    expect(verifyEditKey("", hash)).toBe(false);
  });
});
