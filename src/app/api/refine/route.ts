import { RefineRequestSchema } from "@/lib/contracts/plan";
import { streamRefineResponse } from "@/lib/ai/refine";
import { readValidatedBody, errorResponse, safeHandler, checkAiLimit } from "@/lib/server/http";
import { applyRateLimit, applyOriginCheck } from "@/lib/server/middleware";
import { getStore } from "@/lib/server/store-singleton";
import { buildApiCspHeader } from "@/lib/security/csp";

/** Streams a follow-up AI response about an existing plan. */
export async function POST(request: Request): Promise<Response> {
  return safeHandler(async () => {
    const originErr = applyOriginCheck(request);
    if (originErr) return originErr;

    const rateErr = applyRateLimit(request, "refine");
    if (rateErr) return rateErr;

    const aiErr = checkAiLimit();
    if (aiErr) return aiErr;

    const body = await readValidatedBody(request, "refine", RefineRequestSchema);
    const store = getStore();
    const plan = await store.load(body.planId);
    if (!plan) return errorResponse(404, "Plan not found");

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamRefineResponse(plan.summary, body.question)) {
            controller.enqueue(encoder.encode(chunk));
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Content-Security-Policy": buildApiCspHeader(),
      },
    });
  });
}
