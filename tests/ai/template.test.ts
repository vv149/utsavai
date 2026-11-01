import { describe, it, expect } from "vitest";
import { templateFallbackPlan } from "@/lib/ai/template";
import { AiPlanSchema } from "@/lib/contracts/plan";
import type { Brief } from "@/lib/contracts/plan";

const baseBrief: Brief = {
  eventType: "wedding",
  date: "2025-06-15",
  city: "Mumbai",
  guests: 200,
  budgetInr: 500_000,
  brief: "",
  language: "en",
};

describe("templateFallbackPlan", () => {
  it("returns valid AiPlan for wedding", () => {
    const plan = templateFallbackPlan(baseBrief);
    const result = AiPlanSchema.safeParse(plan);
    expect(result.success).toBe(true);
  });

  it("returns valid AiPlan for birthday", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "birthday" });
    const result = AiPlanSchema.safeParse(plan);
    expect(result.success).toBe(true);
  });

  it("returns valid AiPlan for generic event", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "puja" });
    const result = AiPlanSchema.safeParse(plan);
    expect(result.success).toBe(true);
  });

  it("wedding plan has Rajasthani theme", () => {
    const plan = templateFallbackPlan(baseBrief);
    expect(plan.ideas[0].name).toContain("Rajasthani");
  });

  it("birthday plan has Bollywood theme", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "birthday" });
    expect(plan.ideas[0].name).toContain("Bollywood");
  });

  it("shaadi triggers wedding path", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "shaadi" });
    expect(plan.ideas[0].name).toContain("Rajasthani");
  });

  it("vivah triggers wedding path", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "vivah" });
    expect(plan.ideas[0].name).toContain("Rajasthani");
  });

  it("janamdin triggers birthday path", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "janamdin" });
    expect(plan.ideas[0].name).toContain("Bollywood");
  });

  it("wedding has 7 budget categories", () => {
    const plan = templateFallbackPlan(baseBrief);
    expect(plan.budgetWeights).toHaveLength(7);
  });

  it("non-wedding has 5 budget categories", () => {
    const plan = templateFallbackPlan({ ...baseBrief, eventType: "puja" });
    expect(plan.budgetWeights).toHaveLength(5);
  });

  it("budget weights sum to ~1.0", () => {
    const plan = templateFallbackPlan(baseBrief);
    const sum = plan.budgetWeights.reduce((s, w) => s + w.weight, 0);
    expect(sum).toBeCloseTo(1.0, 1);
  });

  it("has unique task IDs", () => {
    const plan = templateFallbackPlan(baseBrief);
    const ids = plan.tasks.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has unique budget categories", () => {
    const plan = templateFallbackPlan(baseBrief);
    const cats = plan.budgetWeights.map((w) => w.category);
    expect(new Set(cats).size).toBe(cats.length);
  });

  it("has tips", () => {
    const plan = templateFallbackPlan(baseBrief);
    expect(plan.tips.length).toBeGreaterThan(0);
  });

  it("summary includes city", () => {
    const plan = templateFallbackPlan(baseBrief);
    expect(plan.summary).toContain("Mumbai");
  });

  it("summary includes guest count", () => {
    const plan = templateFallbackPlan(baseBrief);
    expect(plan.summary).toContain("200");
  });
});
