import { test, expect } from "@playwright/test";

test.describe("Form validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("shows errors when submitting empty form", async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('[role="alert"]')).toBeVisible();
  });

  test("shows error for missing event type", async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("#err-eventType")).toBeVisible();
  });

  test("shows error for missing date", async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("#err-date")).toBeVisible();
  });

  test("shows error for missing city", async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("#err-city")).toBeVisible();
  });

  test("error summary is focusable", async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    const alert = page.locator('[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toHaveAttribute("tabindex", "-1");
  });

  test("error links point to fields", async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    const links = page.locator('[role="alert"] a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test("budget field shows INR format", async ({ page }) => {
    await page.fill("#field-budgetInr", "500000");
    await expect(page.locator("text=₹")).toBeVisible();
  });

  test("select has event type options", async ({ page }) => {
    const options = page.locator("#field-eventType option");
    const count = await options.count();
    expect(count).toBeGreaterThan(5);
  });

  test("city select has Indian cities", async ({ page }) => {
    const options = page.locator("#field-city option");
    const count = await options.count();
    expect(count).toBeGreaterThan(10);
  });

  test("aria-invalid set on error fields", async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("#field-eventType")).toHaveAttribute("aria-invalid", "true");
  });
});
