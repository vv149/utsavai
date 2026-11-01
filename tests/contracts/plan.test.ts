import { describe, it, expect } from "vitest";
import {
  BriefSchema,
  AiPlanSchema,
  PlanEditSchema,
  RefineRequestSchema,
  VendorRequestSchema,
  BudgetLineSchema,
  ScheduledTaskSchema,
} from "@/lib/contracts/plan";

describe("BriefSchema", () => {
  const valid = {
    eventType: "wedding",
    date: "2025-06-15",
    city: "Mumbai",
    guests: 200,
    budgetInr: 500_000,
  };

  it("accepts valid brief", () => {
    expect(BriefSchema.safeParse(valid).success).toBe(true);
  });

  it("defaults brief to empty string", () => {
    const result = BriefSchema.parse(valid);
    expect(result.brief).toBe("");
  });

  it("defaults language to en", () => {
    const result = BriefSchema.parse(valid);
    expect(result.language).toBe("en");
  });

  it("rejects invalid date format", () => {
    expect(BriefSchema.safeParse({ ...valid, date: "June 15" }).success).toBe(false);
  });

  it("rejects zero guests", () => {
    expect(BriefSchema.safeParse({ ...valid, guests: 0 }).success).toBe(false);
  });

  it("rejects budget below 1000", () => {
    expect(BriefSchema.safeParse({ ...valid, budgetInr: 999 }).success).toBe(false);
  });

  it("rejects extra fields (strict)", () => {
    expect(BriefSchema.safeParse({ ...valid, extra: "bad" }).success).toBe(false);
  });

  it("rejects empty eventType", () => {
    expect(BriefSchema.safeParse({ ...valid, eventType: "" }).success).toBe(false);
  });

  it("accepts large guest count", () => {
    expect(BriefSchema.safeParse({ ...valid, guests: 100_000 }).success).toBe(true);
  });

  it("rejects non-integer guests", () => {
    expect(BriefSchema.safeParse({ ...valid, guests: 200.5 }).success).toBe(false);
  });
});

describe("AiPlanSchema", () => {
  const validPlan = {
    summary: "A beautiful wedding celebration",
    ideas: [{
      name: "Royal",
      concept: "A grand concept",
      palette: ["#fff"],
      decor: ["Flowers"],
      food: ["Biryani"],
      music: ["DJ"],
      signatureMoment: "Dance",
    }],
    budgetWeights: [
      { category: "Venue", weight: 0.4 },
      { category: "Food", weight: 0.6 },
    ],
    tasks: [
      { id: "t1", title: "Book", category: "V", leadDays: 30, depends: [] },
    ],
    vendors: [
      { category: "Venue", query: "venue Mumbai", tips: ["Check reviews"] },
    ],
    tips: ["Book early"],
  };

  it("accepts valid plan", () => {
    expect(AiPlanSchema.safeParse(validPlan).success).toBe(true);
  });

  it("rejects duplicate budget categories", () => {
    const invalid = {
      ...validPlan,
      budgetWeights: [
        { category: "Venue", weight: 0.5 },
        { category: "Venue", weight: 0.5 },
      ],
    };
    expect(AiPlanSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects duplicate task IDs", () => {
    const invalid = {
      ...validPlan,
      tasks: [
        { id: "t1", title: "A", category: "V", leadDays: 30, depends: [] },
        { id: "t1", title: "B", category: "V", leadDays: 20, depends: [] },
      ],
    };
    expect(AiPlanSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects less than 2 budget categories", () => {
    const invalid = {
      ...validPlan,
      budgetWeights: [{ category: "Venue", weight: 1.0 }],
    };
    expect(AiPlanSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects extra fields (strict)", () => {
    expect(AiPlanSchema.safeParse({ ...validPlan, hack: "x" }).success).toBe(false);
  });

  it("rejects short summary", () => {
    expect(AiPlanSchema.safeParse({ ...validPlan, summary: "short" }).success).toBe(false);
  });
});

describe("PlanEditSchema", () => {
  it("accepts budget edit", () => {
    const edit = {
      budget: [
        { category: "A", amount: 50_000, locked: false },
        { category: "B", amount: 40_000, locked: false },
      ],
    };
    expect(PlanEditSchema.safeParse(edit).success).toBe(true);
  });

  it("accepts task toggle edit", () => {
    const edit = { tasks: [{ id: "t1", done: true }] };
    expect(PlanEditSchema.safeParse(edit).success).toBe(true);
  });

  it("rejects empty edit", () => {
    expect(PlanEditSchema.safeParse({}).success).toBe(false);
  });

  it("rejects extra fields", () => {
    expect(PlanEditSchema.safeParse({ budget: [{ category: "A", amount: 100, locked: false }, { category: "B", amount: 100, locked: false }], hack: true }).success).toBe(false);
  });
});

describe("RefineRequestSchema", () => {
  it("accepts valid request", () => {
    expect(RefineRequestSchema.safeParse({ planId: "abc", question: "How?" }).success).toBe(true);
  });

  it("rejects empty question", () => {
    expect(RefineRequestSchema.safeParse({ planId: "abc", question: "" }).success).toBe(false);
  });

  it("rejects missing planId", () => {
    expect(RefineRequestSchema.safeParse({ question: "How?" }).success).toBe(false);
  });
});

describe("VendorRequestSchema", () => {
  it("accepts valid request", () => {
    expect(VendorRequestSchema.safeParse({ planId: "abc", category: "Venue" }).success).toBe(true);
  });

  it("rejects missing category", () => {
    expect(VendorRequestSchema.safeParse({ planId: "abc" }).success).toBe(false);
  });
});

describe("BudgetLineSchema", () => {
  it("accepts valid line", () => {
    expect(BudgetLineSchema.safeParse({ category: "Venue", amount: 100_000, locked: false }).success).toBe(true);
  });

  it("defaults locked to false", () => {
    const result = BudgetLineSchema.parse({ category: "Venue", amount: 100_000 });
    expect(result.locked).toBe(false);
  });

  it("rejects negative amount", () => {
    expect(BudgetLineSchema.safeParse({ category: "Venue", amount: -1, locked: false }).success).toBe(false);
  });
});

describe("ScheduledTaskSchema", () => {
  it("accepts valid task", () => {
    const task = { id: "t1", title: "Test", category: "C", startDate: "2025-01-01", dueDate: "2025-02-01", done: false };
    expect(ScheduledTaskSchema.safeParse(task).success).toBe(true);
  });

  it("defaults done to false", () => {
    const task = { id: "t1", title: "Test", category: "C", startDate: "2025-01-01", dueDate: "2025-02-01" };
    const result = ScheduledTaskSchema.parse(task);
    expect(result.done).toBe(false);
  });
});
