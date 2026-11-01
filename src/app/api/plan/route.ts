import { BriefSchema } from "@/lib/contracts/plan";
import { createPlan } from "@/lib/server/plan-service";
import { readValidatedBody, jsonResponse, safeHandler, checkAiLimit } from "@/lib/server/http";
import { applyRateLimit, applyOriginCheck } from "@/lib/server/middleware";
import { getStore } from "@/lib/server/store-singleton";
import { buildApiCspHeader } from "@/lib/security/csp";

/** Creates a new AI-powered celebration plan. */
export async function POST(request: Request): Promise<Response> {
  return safeHandler(async () => {
    const originErr = applyOriginCheck(request);
    if (originErr) return originErr;

    const rateErr = applyRateLimit(request, "plan");
    if (rateErr) return rateErr;

    const aiErr = checkAiLimit();
    if (aiErr) return aiErr;

    const brief = await readValidatedBody(request, "plan", BriefSchema);
    const today = new Date().toISOString().slice(0, 10);
    const store = getStore();
    const { plan, editKey } = await createPlan(store, brief, today);

    const body = { id: plan.id, editKey, plan: stripSensitive(plan) };
    const response = jsonResponse(body, 201);
    response.headers.set("Content-Security-Policy", buildApiCspHeader());
    return response;
  });
}

function stripSensitive(plan: Record<string, unknown>): Record<string, unknown> {
  const { editKeyHash: _hash, ...rest } = plan;
  return rest;
}
