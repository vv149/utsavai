/** Per-route byte caps enforced BEFORE parsing. */
export const BYTE_CAPS: Record<string, number> = {
  plan: 8 * 1024,
  patch: 16 * 1024,
  refine: 2 * 1024,
  vendors: 1 * 1024,
};

/** Reads request body with a streaming byte cap. Throws if oversized. */
export async function readBodyWithCap(
  request: Request,
  route: string
): Promise<string> {
  const cap = BYTE_CAPS[route] ?? 8 * 1024;
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new BodyValidationError(415, "Content-Type must be application/json");
  }

  const reader = request.body?.getReader();
  if (!reader) {
    throw new BodyValidationError(400, "Missing request body");
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > cap) {
        throw new BodyValidationError(413, `Request body exceeds ${cap} bytes`);
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const decoder = new TextDecoder();
  return chunks.map((c) => decoder.decode(c, { stream: true })).join("") +
    decoder.decode();
}

/** Structured error for body validation failures. */
export class BodyValidationError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "BodyValidationError";
  }
}
