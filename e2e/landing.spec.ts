import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("has page title", async ({ page }) => {
    await expect(page).toHaveTitle(/UtsavAI/);
  });

  test("shows app name in header", async ({ page }) => {
    await expect(page.locator("header")).toContainText("UtsavAI");
  });

  test("has skip link", async ({ page }) => {
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test("skip link becomes visible on focus", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test("has main content landmark", async ({ page }) => {
    await expect(page.locator("main#main-content")).toBeAttached();
  });

  test("has heading hierarchy", async ({ page }) => {
    const h1 = page.locator("h1");
    await expect(h1).toBeAttached();
  });

  test("has event type select", async ({ page }) => {
    await expect(page.locator("#field-eventType")).toBeAttached();
  });

  test("has date input", async ({ page }) => {
    await expect(page.locator("#field-date")).toBeAttached();
  });

  test("has city select", async ({ page }) => {
    await expect(page.locator("#field-city")).toBeAttached();
  });

  test("has guests input", async ({ page }) => {
    await expect(page.locator("#field-guests")).toBeAttached();
  });

  test("has budget input", async ({ page }) => {
    await expect(page.locator("#field-budgetInr")).toBeAttached();
  });

  test("has submit button", async ({ page }) => {
    const btn = page.locator('button[type="submit"]');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText("Create My Plan");
  });

  test("submit button has min 44px height", async ({ page }) => {
    const btn = page.locator('button[type="submit"]');
    const box = await btn.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("footer shows copyright", async ({ page }) => {
    await expect(page.locator("footer")).toContainText("©");
  });

  test("footer shows tagline", async ({ page }) => {
    await expect(page.locator("footer")).toContainText("AI ideates, code calculates");
  });
});
