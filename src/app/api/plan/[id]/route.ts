import { PlanEditSchema } from "@/lib/contracts/plan";
import { editPlan, EditKeyMismatchError, BudgetValidationError } from "@/lib/server/plan-service";
import { readValidatedBody, jsonResponse, errorResponse, safeHandler } from "@/lib/server/http";
import { applyRateLimit, applyOriginCheck } from "@/lib/server/middleware";
import { getStore } from "@/lib/server/store-singleton";
import { hashEditKey } from "@/lib/security/edit-key";
import { buildApiCspHeader } from "@/lib/security/csp";

/** Loads a plan by ID, stripping the edit key hash. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return safeHandler(async () => {
    const { id } = await params;
    const rateErr = applyRateLimit(request, "read");
    if (rateErr) return rateErr;

    const store = getStore();
    const plan = await store.load(id);
    if (!plan) return errorResponse(404, "Plan not found");

    const { editKeyHash: _hash, ...safe } = plan;
    const response = jsonResponse(safe);
    response.headers.set("Content-Security-Policy", buildApiCspHeader());
    return response;
  });
}

/** Edits a plan's budget or task completion via edit key. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return safeHandler(async () => {
    const { id } = await params;
    const originErr = applyOriginCheck(request);
    if (originErr) return originErr;

    const rateErr = applyRateLimit(request, "patch");
    if (rateErr) return rateErr;

    const editKey = request.headers.get("x-edit-key");
    if (!editKey) return errorResponse(403, "Missing edit key");

    const edits = await readValidatedBody(request, "patch", PlanEditSchema);
    const store = getStore();

    try {
      const plan = await store.load(id);
      if (!plan) return errorResponse(404, "Plan not found");

      const updated = await editPlan(store, id, hashEditKey(editKey), edits);
      if (!updated) return errorResponse(404, "Plan not found");

      const { editKeyHash: _hash, ...safe } = updated;
      const response = jsonResponse(safe);
      response.headers.set("Content-Security-Policy", buildApiCspHeader());
      return response;
    } catch (err) {
      if (err instanceof EditKeyMismatchError) {
        return errorResponse(403, "Invalid edit key");
      }
      if (err instanceof BudgetValidationError) {
        return errorResponse(422, "Invalid budget edit");
      }
      throw err;
    }
  });
}
