import type { BudgetLine, BudgetWeight } from "@/lib/contracts/plan";

/** Contingency percentage applied to every plan. */
const CONTINGENCY_PCT = 0.1;

/** Allocates a total INR budget across weighted categories with exact rounding. */
export function allocateBudget(
  totalInr: number,
  weights: readonly BudgetWeight[]
): { lines: BudgetLine[]; contingency: number } {
  if (weights.length === 0) {
    return { lines: [], contingency: totalInr };
  }

  const contingency = Math.round(totalInr * CONTINGENCY_PCT);
  const distributable = totalInr - contingency;
  const weightSum = weights.reduce((s, w) => s + w.weight, 0);

  if (weightSum === 0) {
    const perCategory = Math.floor(distributable / weights.length);
    const remainder = distributable - perCategory * weights.length;
    const lines: BudgetLine[] = weights.map((w, i) => ({
      category: w.category,
      amount: perCategory + (i < remainder ? 1 : 0),
      locked: false,
    }));
    return { lines, contingency };
  }

  const rawAmounts = weights.map(
    (w) => (w.weight / weightSum) * distributable
  );
  const floored = rawAmounts.map(Math.floor);
  let allocated = floored.reduce((s, a) => s + a, 0);
  const remainders = rawAmounts.map((raw, i) => ({
    index: i,
    frac: raw - floored[i],
  }));

  remainders.sort((a, b) => b.frac - a.frac);

  for (const r of remainders) {
    if (allocated >= distributable) break;
    floored[r.index] += 1;
    allocated += 1;
  }

  const lines: BudgetLine[] = weights.map((w, i) => ({
    category: w.category,
    amount: floored[i],
    locked: false,
  }));

  return { lines, contingency };
}

/** Redistributes budget after locking some categories. Locked amounts stay fixed. */
export function redistributeBudget(
  totalInr: number,
  currentLines: readonly BudgetLine[]
): { lines: BudgetLine[]; contingency: number } {
  const contingency = Math.round(totalInr * CONTINGENCY_PCT);
  const distributable = totalInr - contingency;
  const lockedSum = currentLines
    .filter((l) => l.locked)
    .reduce((s, l) => s + l.amount, 0);
  const remaining = distributable - lockedSum;

  if (remaining < 0) {
    return {
      lines: currentLines.map((l) => ({ ...l })),
      contingency,
    };
  }

  const unlocked = currentLines.filter((l) => !l.locked);
  const unlockedSum = unlocked.reduce((s, l) => s + l.amount, 0);

  const lines: BudgetLine[] = [];
  const newAmounts: number[] = [];
  const unlockedIndices: number[] = [];

  for (let i = 0; i < currentLines.length; i++) {
    const line = currentLines[i];
    if (line.locked) {
      lines.push({ ...line });
    } else {
      const proportion =
        unlockedSum > 0 ? line.amount / unlockedSum : 1 / unlocked.length;
      newAmounts.push(Math.floor(proportion * remaining));
      unlockedIndices.push(i);
      lines.push({ ...line, amount: 0 });
    }
  }

  let allocated = newAmounts.reduce((s, a) => s + a, 0);
  const gap = remaining - allocated;

  for (let i = 0; i < gap && i < newAmounts.length; i++) {
    newAmounts[i] += 1;
  }

  for (let j = 0; j < unlockedIndices.length; j++) {
    lines[unlockedIndices[j]].amount = newAmounts[j];
  }

  return { lines, contingency };
}

/** Validates that budget lines sum to total minus contingency. */
export function validateBudgetSum(
  totalInr: number,
  lines: readonly BudgetLine[],
  contingency: number
): boolean {
  const lineSum = lines.reduce((s, l) => s + l.amount, 0);
  return lineSum + contingency === totalInr;
}

/** Returns the contingency amount for a given total. */
export function computeContingency(totalInr: number): number {
  return Math.round(totalInr * CONTINGENCY_PCT);
}
