import { buildApiCspHeader } from "@/lib/security/csp";

export function GET(): Response {
  return new Response(JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }), {
    headers: {
      "Content-Type": "application/json",
      "Content-Security-Policy": buildApiCspHeader(),
    },
  });
}
