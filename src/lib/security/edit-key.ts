import crypto from "node:crypto";

/** Generates a 256-bit random edit key. Returns the raw key (show once) and its hash (store). */
export function generateEditKey(): { key: string; hash: string } {
  const keyBytes = crypto.randomBytes(32);
  const key = keyBytes.toString("base64url");
  const hash = hashEditKey(key);
  return { key, hash };
}

/** Hashes an edit key with SHA-256. */
export function hashEditKey(key: string): string {
  return crypto.createHash("sha256").update(key).digest("hex");
}

/** Constant-time comparison of an edit key against a stored hash. */
export function verifyEditKey(key: string, storedHash: string): boolean {
  const candidateHash = hashEditKey(key);
  const a = Buffer.from(candidateHash, "hex");
  const b = Buffer.from(storedHash, "hex");

  if (a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}
