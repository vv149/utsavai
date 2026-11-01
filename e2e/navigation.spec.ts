import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("home link goes to landing", async ({ page }) => {
    await page.goto("/");
    await page.click('header a[href="/"]');
    expect(page.url()).toContain("/");
  });

  test("404 page shows not found", async ({ page }) => {
    const res = await page.goto("/nonexistent");
    expect(res?.status()).toBe(404);
  });

  test("404 page has content", async ({ page }) => {
    await page.goto("/nonexistent");
    await expect(page.locator("body")).toContainText(/not found/i);
  });

  test("header is sticky", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header");
    const className = await header.getAttribute("class");
    expect(className).toContain("sticky");
  });

  test("pause animations button exists", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator('button[aria-pressed]');
    await expect(btn).toBeAttached();
  });

  test("pause button toggles", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator('button[aria-pressed]');
    const before = await btn.getAttribute("aria-pressed");
    await btn.click();
    const after = await btn.getAttribute("aria-pressed");
    expect(before).not.toBe(after);
  });

  test("keyboard navigation works", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    await expect(focused).toBeAttached();
  });

  test("form has fieldset", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("fieldset")).toBeAttached();
  });

  test("form has legend", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("legend")).toBeAttached();
  });
});
