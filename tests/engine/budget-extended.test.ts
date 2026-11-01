import { describe, it, expect } from "vitest";
import {
  allocateBudget,
  redistributeBudget,
  validateBudgetSum,
  computeContingency,
} from "@/lib/engine/budget";

describe("allocateBudget edge cases", () => {
  it("handles budget of 1", () => {
    const { lines, contingency } = allocateBudget(1, [
      { category: "A", weight: 1 },
    ]);
    expect(lines[0].amount + contingency).toBe(1);
  });

  it("handles budget of 10", () => {
    const { lines, contingency } = allocateBudget(10, [
      { category: "A", weight: 0.5 },
      { category: "B", weight: 0.5 },
    ]);
    expect(lines.reduce((s, l) => s + l.amount, 0) + contingency).toBe(10);
  });

  for (const total of [999, 7777, 33333, 100_000, 999_999, 5_000_000]) {
    it(`exact sum invariant for budget ${total}`, () => {
      const weights = [
        { category: "Venue", weight: 0.35 },
        { category: "Food", weight: 0.25 },
        { category: "Decor", weight: 0.15 },
        { category: "Photo", weight: 0.10 },
        { category: "Music", weight: 0.08 },
        { category: "Attire", weight: 0.07 },
      ];
      const { lines, contingency } = allocateBudget(total, weights);
      const sum = lines.reduce((s, l) => s + l.amount, 0) + contingency;
      expect(sum).toBe(total);
      lines.forEach((l) => expect(Number.isInteger(l.amount)).toBe(true));
    });
  }

  it("preserves category names", () => {
    const { lines } = allocateBudget(100_000, [
      { category: "Venue Hall", weight: 0.5 },
      { category: "Biryani Counter", weight: 0.5 },
    ]);
    expect(lines[0].category).toBe("Venue Hall");
    expect(lines[1].category).toBe("Biryani Counter");
  });

  it("higher weight gets more money", () => {
    const { lines } = allocateBudget(100_000, [
      { category: "A", weight: 0.9 },
      { category: "B", weight: 0.1 },
    ]);
    expect(lines[0].amount).toBeGreaterThan(lines[1].amount);
  });

  it("equal weights get equal amounts (±1 for rounding)", () => {
    const { lines } = allocateBudget(100_000, [
      { category: "A", weight: 0.5 },
      { category: "B", weight: 0.5 },
    ]);
    expect(Math.abs(lines[0].amount - lines[1].amount)).toBeLessThanOrEqual(1);
  });

  it("contingency is always 10%", () => {
    for (const total of [1000, 50_000, 123_456, 10_000_000]) {
      const { contingency } = allocateBudget(total, [
        { category: "A", weight: 1 },
      ]);
      expect(contingency).toBe(computeContingency(total));
    }
  });
});

describe("redistributeBudget edge cases", () => {
  it("single unlocked line gets all remaining", () => {
    const { lines, contingency } = redistributeBudget(100_000, [
      { category: "A", amount: 50_000, locked: true },
      { category: "B", amount: 40_000, locked: false },
    ]);
    const unlockedAmount = lines.find((l) => l.category === "B")!.amount;
    expect(unlockedAmount + 50_000 + contingency).toBe(100_000);
  });

  it("preserves all locked amounts", () => {
    const locked = [
      { category: "A", amount: 20_000, locked: true },
      { category: "B", amount: 30_000, locked: true },
      { category: "C", amount: 10_000, locked: false },
    ];
    const { lines } = redistributeBudget(100_000, locked);
    expect(lines.find((l) => l.category === "A")!.amount).toBe(20_000);
    expect(lines.find((l) => l.category === "B")!.amount).toBe(30_000);
  });

  it("sum always equals total", () => {
    for (const total of [50_000, 100_000, 200_000]) {
      const { lines, contingency } = redistributeBudget(total, [
        { category: "A", amount: 20_000, locked: true },
        { category: "B", amount: 30_000, locked: false },
        { category: "C", amount: 10_000, locked: false },
      ]);
      expect(lines.reduce((s, l) => s + l.amount, 0) + contingency).toBe(total);
    }
  });
});

describe("validateBudgetSum extended", () => {
  it("validates with many lines", () => {
    const lines = Array.from({ length: 10 }, (_, i) => ({
      category: `C${i}`,
      amount: 9000,
      locked: false,
    }));
    expect(validateBudgetSum(100_000, lines, 10_000)).toBe(true);
  });

  it("rejects off-by-one high", () => {
    expect(validateBudgetSum(100_000, [
      { category: "A", amount: 45_001, locked: false },
      { category: "B", amount: 45_000, locked: false },
    ], 10_000)).toBe(false);
  });

  it("rejects off-by-one low", () => {
    expect(validateBudgetSum(100_000, [
      { category: "A", amount: 44_999, locked: false },
      { category: "B", amount: 45_000, locked: false },
    ], 10_000)).toBe(false);
  });
});

describe("computeContingency extended", () => {
  for (const val of [1, 10, 100, 1000, 12345, 99999, 1_000_000]) {
    it(`10% of ${val}`, () => {
      expect(computeContingency(val)).toBe(Math.round(val * 0.1));
    });
  }
});
