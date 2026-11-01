import { describe, it, expect, beforeEach } from "vitest";
import { jsonResponse, errorResponse, safeHandler, checkAiLimit } from "@/lib/server/http";
import { BodyValidationError } from "@/lib/security/body";
import { resetRateLimits, AI_CEILING } from "@/lib/security/rate-limit";
import { z } from "zod/v4";

beforeEach(() => {
  resetRateLimits();
});

describe("jsonResponse", () => {
  it("returns 200 by default", () => {
    const res = jsonResponse({ ok: true });
    expect(res.status).toBe(200);
  });

  it("sets content-type to json", () => {
    const res = jsonResponse({});
    expect(res.headers.get("content-type")).toBe("application/json");
  });

  it("serializes body as JSON", async () => {
    const res = jsonResponse({ data: 42 });
    const body = await res.json();
    expect(body.data).toBe(42);
  });

  it("accepts custom status", () => {
    const res = jsonResponse({}, 201);
    expect(res.status).toBe(201);
  });
});

describe("errorResponse", () => {
  it("returns error message in body", async () => {
    const res = errorResponse(400, "Bad request");
    const body = await res.json();
    expect(body.error).toBe("Bad request");
  });

  it("returns correct status", () => {
    const res = errorResponse(404, "Not found");
    expect(res.status).toBe(404);
  });
});

describe("safeHandler", () => {
  it("returns handler result on success", async () => {
    const res = await safeHandler(async () => jsonResponse({ ok: true }));
    expect(res.status).toBe(200);
  });

  it("catches BodyValidationError", async () => {
    const res = await safeHandler(async () => {
      throw new BodyValidationError(413, "Too big");
    });
    expect(res.status).toBe(413);
  });

  it("catches ZodError as 422", async () => {
    const res = await safeHandler(async () => {
      z.string().parse(123 as unknown);
      return jsonResponse({});
    });
    expect(res.status).toBe(422);
  });

  it("catches SyntaxError as 400", async () => {
    const res = await safeHandler(async () => {
      JSON.parse("invalid json");
      return jsonResponse({});
    });
    expect(res.status).toBe(400);
  });

  it("catches unknown errors as 500", async () => {
    const res = await safeHandler(async () => {
      throw new Error("oops");
    });
    expect(res.status).toBe(500);
  });
});

describe("checkAiLimit", () => {
  it("returns null when under ceiling", () => {
    expect(checkAiLimit()).toBeNull();
  });

  it("returns 503 when ceiling exceeded", () => {
    for (let i = 0; i < AI_CEILING.maxRequests; i++) {
      checkAiLimit();
    }
    const res = checkAiLimit();
    expect(res).not.toBeNull();
    expect(res!.status).toBe(503);
  });

  it("includes Retry-After header when blocked", () => {
    for (let i = 0; i < AI_CEILING.maxRequests; i++) {
      checkAiLimit();
    }
    const res = checkAiLimit();
    expect(res!.headers.get("retry-after")).toBeTruthy();
  });
});
