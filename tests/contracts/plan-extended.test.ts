import { describe, it, expect } from "vitest";
import { BriefSchema, AiPlanSchema, PlanEditSchema, VendorRequestSchema, RefineRequestSchema } from "@/lib/contracts/plan";

describe("BriefSchema extended", () => {
  const valid = {
    eventType: "wedding",
    date: "2025-12-31",
    city: "Mumbai",
    guests: 200,
    budgetInr: 500000,
    brief: "Royal theme",
    language: "en",
  };

  it("accepts valid brief", () => {
    expect(BriefSchema.parse(valid)).toBeTruthy();
  });

  it("rejects missing eventType", () => {
    const { eventType, ...rest } = valid;
    expect(() => BriefSchema.parse(rest)).toThrow();
  });

  it("rejects missing date", () => {
    const { date, ...rest } = valid;
    expect(() => BriefSchema.parse(rest)).toThrow();
  });

  it("rejects missing city", () => {
    const { city, ...rest } = valid;
    expect(() => BriefSchema.parse(rest)).toThrow();
  });

  it("rejects zero guests", () => {
    expect(() => BriefSchema.parse({ ...valid, guests: 0 })).toThrow();
  });

  it("rejects negative budget", () => {
    expect(() => BriefSchema.parse({ ...valid, budgetInr: -1 })).toThrow();
  });

  it("accepts without brief (optional)", () => {
    const { brief, ...rest } = valid;
    expect(BriefSchema.parse(rest)).toBeTruthy();
  });

  it("rejects extra fields (strict)", () => {
    expect(() => BriefSchema.parse({ ...valid, hack: true })).toThrow();
  });

  it("accepts Hindi city name", () => {
    expect(BriefSchema.parse({ ...valid, city: "Delhi" })).toBeTruthy();
  });

  it("accepts large guest count", () => {
    expect(BriefSchema.parse({ ...valid, guests: 10000 })).toBeTruthy();
  });

  it("accepts large budget", () => {
    expect(BriefSchema.parse({ ...valid, budgetInr: 100000000 })).toBeTruthy();
  });
});

describe("PlanEditSchema extended", () => {
  it("accepts budget change with 2+ items", () => {
    expect(PlanEditSchema.parse({
      budget: [
        { category: "Venue", amount: 50000, locked: false },
        { category: "Food", amount: 30000, locked: false },
      ],
    })).toBeTruthy();
  });

  it("accepts task toggle", () => {
    expect(PlanEditSchema.parse({ tasks: [{ id: "task-1", done: true }] })).toBeTruthy();
  });

  it("rejects empty object (needs budget or tasks)", () => {
    const result = PlanEditSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects extra fields (strict)", () => {
    expect(() => PlanEditSchema.parse({ hack: true })).toThrow();
  });

  it("rejects budget with 1 item (min 2)", () => {
    const result = PlanEditSchema.safeParse({ budget: [{ category: "A", amount: 100, locked: false }] });
    expect(result.success).toBe(false);
  });
});

describe("VendorRequestSchema extended", () => {
  it("accepts valid request", () => {
    expect(VendorRequestSchema.parse({ planId: "abc", category: "Venue" })).toBeTruthy();
  });

  it("rejects missing planId", () => {
    expect(() => VendorRequestSchema.parse({ category: "Venue" })).toThrow();
  });

  it("rejects missing category", () => {
    expect(() => VendorRequestSchema.parse({ planId: "abc" })).toThrow();
  });

  it("rejects extra fields (strict)", () => {
    expect(() => VendorRequestSchema.parse({ planId: "abc", category: "Venue", extra: 1 })).toThrow();
  });
});

describe("RefineRequestSchema extended", () => {
  it("accepts valid request", () => {
    expect(RefineRequestSchema.parse({ planId: "abc", question: "How many guests?" })).toBeTruthy();
  });

  it("rejects missing planId", () => {
    expect(() => RefineRequestSchema.parse({ question: "q" })).toThrow();
  });

  it("rejects missing question", () => {
    expect(() => RefineRequestSchema.parse({ planId: "abc" })).toThrow();
  });

  it("rejects empty question", () => {
    expect(() => RefineRequestSchema.parse({ planId: "abc", question: "" })).toThrow();
  });

  it("rejects extra fields (strict)", () => {
    expect(() => RefineRequestSchema.parse({ planId: "abc", question: "q", extra: 1 })).toThrow();
  });
});
