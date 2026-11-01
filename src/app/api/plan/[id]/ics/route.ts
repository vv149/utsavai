import { generateIcs } from "@/lib/engine/ical";
import { errorResponse, safeHandler } from "@/lib/server/http";
import { applyRateLimit } from "@/lib/server/middleware";
import { getStore } from "@/lib/server/store-singleton";
import { buildApiCspHeader } from "@/lib/security/csp";

/** Exports a plan's timeline as an ICS calendar file. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return safeHandler(async () => {
    const { id } = await params;
    const rateErr = applyRateLimit(request, "ics");
    if (rateErr) return rateErr;

    const store = getStore();
    const plan = await store.load(id);
    if (!plan) return errorResponse(404, "Plan not found");

    const ics = generateIcs(plan.tasks, plan.brief.eventType, plan.brief.date);

    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="utsavai-${id}.ics"`,
        "Content-Security-Policy": buildApiCspHeader(),
      },
    });
  });
}
