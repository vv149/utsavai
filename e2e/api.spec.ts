import { test, expect } from "@playwright/test";

test.describe("API endpoints", () => {
  test("GET /api/health returns 200", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeTruthy();
  });

  test("health response has CSP header", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.headers()["content-security-policy"]).toBeTruthy();
  });

  test("POST /api/plan without body returns error", async ({ request }) => {
    const res = await request.post("/api/plan");
    expect(res.ok()).toBeFalsy();
  });

  test("POST /api/plan with invalid JSON returns 400", async ({ request }) => {
    const res = await request.post("/api/plan", {
      headers: { "Content-Type": "application/json" },
      data: "invalid json{",
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  test("GET /api/plan/nonexistent returns 404", async ({ request }) => {
    const res = await request.get("/api/plan/nonexistent-id-12345");
    expect(res.status()).toBe(404);
  });

  test("PATCH /api/plan without edit key returns 403", async ({ request }) => {
    const res = await request.patch("/api/plan/some-id", {
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({ tasks: [{ id: "t1", done: true }] }),
    });
    expect(res.status()).toBe(403);
  });

  test("GET /api/plan/nonexistent/ics returns 404", async ({ request }) => {
    const res = await request.get("/api/plan/nonexistent-id/ics");
    expect(res.status()).toBe(404);
  });

  test("POST /api/vendors without body returns error", async ({ request }) => {
    const res = await request.post("/api/vendors");
    expect(res.ok()).toBeFalsy();
  });

  test("POST /api/refine without body returns error", async ({ request }) => {
    const res = await request.post("/api/refine");
    expect(res.ok()).toBeFalsy();
  });

  test("POST /api/plan with oversized body returns 413", async ({ request }) => {
    const bigData = JSON.stringify({ data: "x".repeat(20_000) });
    const res = await request.post("/api/plan", {
      headers: { "Content-Type": "application/json" },
      data: bigData,
    });
    expect(res.status()).toBe(413);
  });
});
