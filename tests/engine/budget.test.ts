import { describe, it, expect } from "vitest";
import {
  allocateBudget,
  redistributeBudget,
  validateBudgetSum,
  computeContingency,
} from "@/lib/engine/budget";

describe("allocateBudget", () => {
  it("allocates proportionally to weights", () => {
    const { lines, contingency } = allocateBudget(100_000, [
      { category: "Venue", weight: 0.5 },
      { category: "Food", weight: 0.5 },
    ]);
    expect(lines).toHaveLength(2);
    expect(lines[0].amount + lines[1].amount + contingency).toBe(100_000);
  });

  it("handles single category", () => {
    const { lines, contingency } = allocateBudget(50_000, [
      { category: "Venue", weight: 1.0 },
    ]);
    expect(lines[0].amount + contingency).toBe(50_000);
  });

  it("returns all to contingency when no weights", () => {
    const { lines, contingency } = allocateBudget(100_000, []);
    expect(lines).toHaveLength(0);
    expect(contingency).toBe(100_000);
  });

  it("handles zero weights evenly", () => {
    const { lines } = allocateBudget(100_000, [
      { category: "A", weight: 0 },
      { category: "B", weight: 0 },
    ]);
    expect(lines[0].amount + lines[1].amount).toBe(90_000);
  });

  it("distributes remainders correctly (sum is exact)", () => {
    const { lines, contingency } = allocateBudget(100_001, [
      { category: "A", weight: 0.33 },
      { category: "B", weight: 0.33 },
      { category: "C", weight: 0.34 },
    ]);
    const sum = lines.reduce((s, l) => s + l.amount, 0) + contingency;
    expect(sum).toBe(100_001);
  });

  it("all lines start unlocked", () => {
    const { lines } = allocateBudget(100_000, [
      { category: "A", weight: 0.5 },
      { category: "B", weight: 0.5 },
    ]);
    expect(lines.every((l) => l.locked === false)).toBe(true);
  });

  it("handles very small budget", () => {
    const { lines, contingency } = allocateBudget(1000, [
      { category: "A", weight: 0.7 },
      { category: "B", weight: 0.3 },
    ]);
    expect(lines.reduce((s, l) => s + l.amount, 0) + contingency).toBe(1000);
  });

  it("handles large budget with many categories", () => {
    const weights = Array.from({ length: 10 }, (_, i) => ({
      category: `Cat${i}`,
      weight: 0.1,
    }));
    const { lines, contingency } = allocateBudget(10_000_000, weights);
    expect(lines.reduce((s, l) => s + l.amount, 0) + contingency).toBe(10_000_000);
  });

  it("handles unequal weights", () => {
    const { lines } = allocateBudget(100_000, [
      { category: "Venue", weight: 0.6 },
      { category: "Food", weight: 0.2 },
      { category: "Decor", weight: 0.2 },
    ]);
    expect(lines[0].amount).toBeGreaterThan(lines[1].amount);
  });

  it("handles weights summing to more than 1", () => {
    const { lines, contingency } = allocateBudget(100_000, [
      { category: "A", weight: 0.8 },
      { category: "B", weight: 0.8 },
    ]);
    expect(lines.reduce((s, l) => s + l.amount, 0) + contingency).toBe(100_000);
  });

  it("handles weights summing to less than 1", () => {
    const { lines, contingency } = allocateBudget(100_000, [
      { category: "A", weight: 0.1 },
      { category: "B", weight: 0.1 },
    ]);
    expect(lines.reduce((s, l) => s + l.amount, 0) + contingency).toBe(100_000);
  });

  // Seeded random budget tests
  for (let seed = 1; seed <= 20; seed++) {
    it(`seeded random budget test #${seed}`, () => {
      const total = 10_000 + seed * 7_777;
      const numCats = 2 + (seed % 5);
      const weights = Array.from({ length: numCats }, (_, i) => ({
        category: `Cat${i}`,
        weight: (i + 1) / (numCats * (numCats + 1) / 2),
      }));
      const { lines, contingency } = allocateBudget(total, weights);
      const sum = lines.reduce((s, l) => s + l.amount, 0) + contingency;
      expect(sum).toBe(total);
      for (const l of lines) {
        expect(l.amount).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(l.amount)).toBe(true);
      }
    });
  }
});

describe("redistributeBudget", () => {
  it("keeps locked amounts fixed", () => {
    const { lines } = redistributeBudget(100_000, [
      { category: "A", amount: 30_000, locked: true },
      { category: "B", amount: 40_000, locked: false },
      { category: "C", amount: 20_000, locked: false },
    ]);
    expect(lines.find((l) => l.category === "A")?.amount).toBe(30_000);
  });

  it("distributes remaining to unlocked proportionally", () => {
    const { lines, contingency } = redistributeBudget(100_000, [
      { category: "A", amount: 30_000, locked: true },
      { category: "B", amount: 40_000, locked: false },
      { category: "C", amount: 20_000, locked: false },
    ]);
    const sum = lines.reduce((s, l) => s + l.amount, 0) + contingency;
    expect(sum).toBe(100_000);
  });

  it("handles all locked", () => {
    const { lines } = redistributeBudget(100_000, [
      { category: "A", amount: 45_000, locked: true },
      { category: "B", amount: 45_000, locked: true },
    ]);
    expect(lines[0].amount).toBe(45_000);
    expect(lines[1].amount).toBe(45_000);
  });

  it("handles no locked", () => {
    const { lines, contingency } = redistributeBudget(100_000, [
      { category: "A", amount: 50_000, locked: false },
      { category: "B", amount: 40_000, locked: false },
    ]);
    expect(lines.reduce((s, l) => s + l.amount, 0) + contingency).toBe(100_000);
  });

  it("handles negative remaining gracefully", () => {
    const { lines } = redistributeBudget(100_000, [
      { category: "A", amount: 95_000, locked: true },
      { category: "B", amount: 5_000, locked: false },
    ]);
    expect(lines).toHaveLength(2);
  });
});

describe("validateBudgetSum", () => {
  it("returns true for valid sum", () => {
    expect(validateBudgetSum(100_000, [
      { category: "A", amount: 45_000, locked: false },
      { category: "B", amount: 45_000, locked: false },
    ], 10_000)).toBe(true);
  });

  it("returns false for invalid sum", () => {
    expect(validateBudgetSum(100_000, [
      { category: "A", amount: 40_000, locked: false },
      { category: "B", amount: 40_000, locked: false },
    ], 10_000)).toBe(false);
  });

  it("handles empty lines", () => {
    expect(validateBudgetSum(10_000, [], 10_000)).toBe(true);
  });
});

describe("computeContingency", () => {
  it("returns 10% of total", () => {
    expect(computeContingency(100_000)).toBe(10_000);
  });

  it("rounds correctly", () => {
    expect(computeContingency(100_001)).toBe(10_000);
    expect(computeContingency(100_005)).toBe(10_001);
  });

  it("returns 0 for 0", () => {
    expect(computeContingency(0)).toBe(0);
  });
});
