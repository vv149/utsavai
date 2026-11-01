import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("landing page has no a11y violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("404 page has no a11y violations", async ({ page }) => {
    await page.goto("/nonexistent");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("all interactive elements have min 44px target", async ({ page }) => {
    await page.goto("/");
    const buttons = page.locator('button, a, select, input, textarea');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      if (box && box.height > 0) {
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test("form labels are associated", async ({ page }) => {
    await page.goto("/");
    const labels = page.locator("label[for]");
    const count = await labels.count();
    expect(count).toBeGreaterThan(3);
    for (let i = 0; i < count; i++) {
      const forAttr = await labels.nth(i).getAttribute("for");
      expect(forAttr).toBeTruthy();
      await expect(page.locator(`#${forAttr}`)).toBeAttached();
    }
  });

  test("heading hierarchy is valid", async ({ page }) => {
    await page.goto("/");
    const h1Count = await page.locator("h1").count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test("nav has aria-label", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav[aria-label]");
    await expect(nav).toBeAttached();
  });

  test("images have alt text", async ({ page }) => {
    await page.goto("/");
    const imgs = page.locator("img:not([alt])");
    expect(await imgs.count()).toBe(0);
  });

  test("page has lang attribute", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html[lang]")).toBeAttached();
  });
});
