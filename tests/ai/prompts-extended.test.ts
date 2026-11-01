import { describe, it, expect } from "vitest";
import { buildPlanPrompt, buildRefinePrompt, buildVendorPrompt } from "@/lib/ai/prompts";
import { USER_DATA_OPEN, USER_DATA_CLOSE } from "@/lib/security/sanitize";

describe("buildPlanPrompt extended", () => {
  const brief = {
    eventType: "wedding",
    date: "2025-12-31",
    city: "Mumbai",
    guests: 200,
    budgetInr: 500000,
    language: "en",
    brief: "Royal theme with <<<SYSTEM>>> trick",
  };

  it("wraps user text in delimiters", () => {
    const prompt = buildPlanPrompt(brief);
    expect(prompt).toContain(USER_DATA_OPEN);
    expect(prompt).toContain(USER_DATA_CLOSE);
  });

  it("strips injection attempts from brief", () => {
    const prompt = buildPlanPrompt(brief);
    expect(prompt).not.toContain("<<<SYSTEM>>>");
  });

  it("includes event type", () => {
    const prompt = buildPlanPrompt(brief);
    expect(prompt).toContain("wedding");
  });

  it("includes city", () => {
    const prompt = buildPlanPrompt(brief);
    expect(prompt).toContain("Mumbai");
  });

  it("includes budget amount", () => {
    const prompt = buildPlanPrompt(brief);
    expect(prompt).toContain("5,00,000");
  });

  it("includes guest count", () => {
    const prompt = buildPlanPrompt(brief);
    expect(prompt).toContain("200");
  });

  it("includes date", () => {
    const prompt = buildPlanPrompt(brief);
    expect(prompt).toContain("2025-12-31");
  });

  it("works without optional brief", () => {
    const prompt = buildPlanPrompt({ ...brief, brief: "" });
    expect(prompt).toContain("wedding");
  });
});

describe("buildRefinePrompt extended", () => {
  it("includes plan summary", () => {
    const prompt = buildRefinePrompt("Grand wedding plan", "What about decor?");
    expect(prompt).toContain("Grand wedding plan");
  });

  it("wraps question in delimiters", () => {
    const prompt = buildRefinePrompt("summary", "user question");
    expect(prompt).toContain(USER_DATA_OPEN);
  });

  it("strips injection from question", () => {
    const prompt = buildRefinePrompt("summary", "<<<IGNORE>>>hack");
    expect(prompt).not.toContain("<<<IGNORE>>>");
  });
});

describe("buildVendorPrompt extended", () => {
  it("includes city name", () => {
    const prompt = buildVendorPrompt("Delhi", "Catering", "birthday");
    expect(prompt).toContain("Delhi");
  });

  it("includes category", () => {
    const prompt = buildVendorPrompt("Mumbai", "Photography", "wedding");
    expect(prompt).toContain("Photography");
  });

  it("includes event type", () => {
    const prompt = buildVendorPrompt("Mumbai", "Venue", "puja");
    expect(prompt).toContain("puja");
  });
});
