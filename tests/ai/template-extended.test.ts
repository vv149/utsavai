import { describe, it, expect } from "vitest";
import { templateFallbackPlan } from "@/lib/ai/template";
import { AiPlanSchema } from "@/lib/contracts/plan";

describe("templateFallbackPlan extended", () => {
  const baseBrief = { eventType: "wedding", date: "2025-12-31", city: "Mumbai", guests: 200, budgetInr: 500000, brief: "", language: "en" };

  it("produces valid plan for wedding with 50 guests", () => {
    const brief = { ...baseBrief, guests: 50, budgetInr: 100000 };
    const plan = templateFallbackPlan(brief);
    expect(AiPlanSchema.parse(plan)).toBeTruthy();
  });

  it("produces valid plan for wedding with 1000 guests", () => {
    const brief = { ...baseBrief, guests: 1000, budgetInr: 5000000 };
    const plan = templateFallbackPlan(brief);
    expect(AiPlanSchema.parse(plan)).toBeTruthy();
  });

  it("produces valid plan for birthday", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "birthday", budgetInr: 50000 });
    expect(AiPlanSchema.parse(plan)).toBeTruthy();
  });

  it("produces valid plan for puja", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "puja", budgetInr: 30000 });
    expect(AiPlanSchema.parse(plan)).toBeTruthy();
  });

  it("produces valid plan for engagement", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "engagement" });
    expect(AiPlanSchema.parse(plan)).toBeTruthy();
  });

  it("produces valid plan for housewarming", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "housewarming" });
    expect(AiPlanSchema.parse(plan)).toBeTruthy();
  });

  it("produces valid plan for retirement", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "retirement" });
    expect(AiPlanSchema.parse(plan)).toBeTruthy();
  });

  it("always has at least 1 idea", () => {
    for (const type of ["wedding", "birthday", "puja", "corporate", "engagement"]) {
      const plan = templateFallbackPlan({ ...baseBrief, eventType: type });
      expect(plan.ideas.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("ideas always have palettes", () => {
    const plan = templateFallbackPlan(baseBrief);
    plan.ideas.forEach((idea) => {
      expect(idea.palette.length).toBeGreaterThan(0);
    });
  });

  it("tasks always have unique IDs", () => {
    const plan = templateFallbackPlan(baseBrief);
    const ids = plan.tasks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("budget weights sum close to 1", () => {
    const plan = templateFallbackPlan(baseBrief);
    const sum = plan.budgetWeights.reduce((s, w) => s + w.weight, 0);
    expect(sum).toBeGreaterThan(0.95);
    expect(sum).toBeLessThanOrEqual(1.01);
  });

  it("tips are non-empty strings", () => {
    const plan = templateFallbackPlan(baseBrief);
    expect(plan.tips.length).toBeGreaterThan(0);
    plan.tips.forEach((tip) => expect(tip.length).toBeGreaterThan(0));
  });

  it("summary is non-empty", () => {
    const plan = templateFallbackPlan(baseBrief);
    expect(plan.summary.length).toBeGreaterThan(10);
  });

  it("vendor suggestions exist", () => {
    const plan = templateFallbackPlan(baseBrief);
    expect(plan.vendors.length).toBeGreaterThan(0);
  });

  it("budget weights have unique categories", () => {
    const plan = templateFallbackPlan(baseBrief);
    const cats = plan.budgetWeights.map((w) => w.category);
    expect(new Set(cats).size).toBe(cats.length);
  });

  it("all task leadDays are positive", () => {
    const plan = templateFallbackPlan(baseBrief);
    plan.tasks.forEach((t) => expect(t.leadDays).toBeGreaterThan(0));
  });

  it("works with different cities", () => {
    for (const city of ["Delhi", "Bangalore", "Kolkata", "Chennai"]) {
      const plan = templateFallbackPlan({ ...baseBrief, city });
      expect(AiPlanSchema.parse(plan)).toBeTruthy();
    }
  });

  it("works with min budget", () => {
    const plan = templateFallbackPlan({ ...baseBrief, budgetInr: 1000 });
    expect(AiPlanSchema.parse(plan)).toBeTruthy();
  });
});
