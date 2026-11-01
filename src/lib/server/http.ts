import { z } from "zod/v4";
import { readBodyWithCap, BodyValidationError } from "@/lib/security/body";
import { checkAiCeiling } from "@/lib/security/rate-limit";
import { log } from "./log";

/** Reads and validates a JSON request body against a Zod schema. */
export async function readValidatedBody<T>(
  request: Request,
  route: string,
  schema: z.ZodType<T>
): Promise<T> {
  const raw = await readBodyWithCap(request, route);
  const parsed = JSON.parse(raw);
  return schema.parse(parsed);
}

/** Creates a JSON Response. */
export function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Creates an error JSON Response. */
export function errorResponse(status: number, message: string): Response {
  return jsonResponse({ error: message }, status);
}

/** Wraps a route handler with error catching. */
export async function safeHandler(
  fn: () => Promise<Response>
): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof BodyValidationError) {
      return errorResponse(err.status, err.message);
    }
    if (err instanceof z.ZodError) {
      return errorResponse(422, "Validation failed");
    }
    if (err instanceof SyntaxError) {
      return errorResponse(400, "Invalid JSON");
    }
    log("error", "unhandled_error", {
      name: err instanceof Error ? err.name : "unknown",
    });
    return errorResponse(500, "Internal server error");
  }
}

/** Checks the global AI ceiling. Returns 503 Response if exceeded, null if OK. */
export function checkAiLimit(): Response | null {
  const result = checkAiCeiling();
  if (!result.allowed) {
    return new Response(JSON.stringify({ error: "AI capacity exceeded" }), {
      status: 503,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfterSeconds),
      },
    });
  }
  return null;
}
