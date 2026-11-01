import { VendorRequestSchema } from "@/lib/contracts/plan";
import { fetchVendorPlaces } from "@/lib/ai/vendors";
import { readValidatedBody, jsonResponse, errorResponse, safeHandler, checkAiLimit } from "@/lib/server/http";
import { applyRateLimit, applyOriginCheck } from "@/lib/server/middleware";
import { getStore } from "@/lib/server/store-singleton";
import { buildApiCspHeader } from "@/lib/security/csp";

export async function POST(request: Request): Promise<Response> {
  return safeHandler(async () => {
    const originErr = applyOriginCheck(request);
    if (originErr) return originErr;

    const rateErr = applyRateLimit(request, "vendors");
    if (rateErr) return rateErr;

    const aiErr = checkAiLimit();
    if (aiErr) return aiErr;

    const body = await readValidatedBody(request, "vendors", VendorRequestSchema);
    const store = getStore();
    const plan = await store.load(body.planId);
    if (!plan) return errorResponse(404, "Plan not found");

    const places = await fetchVendorPlaces(
      plan.brief.city,
      body.category,
      plan.brief.eventType
    );

    const response = jsonResponse({ places });
    response.headers.set("Content-Security-Policy", buildApiCspHeader());
    return response;
  });
}
