"use client";

import { useCallback } from "react";
import type { BudgetLine } from "@/lib/contracts/plan";
import { formatInr, formatPercent } from "@/lib/engine/format";
import { redistributeBudget } from "@/lib/engine/budget";

/** Budget tab with sliders for reallocation. */
export function BudgetTab({
  budget,
  contingency,
  totalInr,
  readOnly,
  onBudgetChange,
}: {
  budget: readonly BudgetLine[];
  contingency: number;
  totalInr: number;
  readOnly: boolean;
  onBudgetChange: (budget: BudgetLine[]) => void;
}) {
  const distributable = totalInr - contingency;

  const handleSliderChange = useCallback(
    (index: number, newAmount: number) => {
      const updated = budget.map((line, i) => {
        if (i === index) return { ...line, amount: newAmount };
        return { ...line };
      });

      const currentSum = updated.reduce((s, l) => s + l.amount, 0);
      const diff = currentSum - distributable;

      if (diff !== 0) {
        const otherUnlocked = updated.filter((l, i) => i !== index && !l.locked);
        if (otherUnlocked.length === 0) return;

        const otherSum = otherUnlocked.reduce((s, l) => s + l.amount, 0);
        let remaining = diff;

        for (const line of otherUnlocked) {
          const proportion = otherSum > 0 ? line.amount / otherSum : 1 / otherUnlocked.length;
          const adjustment = Math.round(proportion * diff);
          line.amount = Math.max(0, line.amount - adjustment);
          remaining -= adjustment;
        }

        if (remaining !== 0 && otherUnlocked.length > 0) {
          otherUnlocked[0].amount -= remaining;
        }
      }

      onBudgetChange(updated);
    },
    [budget, distributable, onBudgetChange]
  );

  const handleLockToggle = useCallback(
    (index: number) => {
      const updated = budget.map((line, i) => {
        if (i === index) return { ...line, locked: !line.locked };
        return { ...line };
      });
      const { lines } = redistributeBudget(totalInr, updated);
      onBudgetChange(lines);
    },
    [budget, totalInr, onBudgetChange]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold" style={{ color: "var(--color-gold)" }}>
        Budget Allocation
      </h2>
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Total: {formatInr(totalInr)} (Contingency: {formatInr(contingency)})
      </p>

      <div className="space-y-4">
        {budget.map((line, i) => (
          <div
            key={line.category}
            className="rounded-lg p-4"
            style={{ backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
          >
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor={`budget-slider-${i}`}
                className="font-medium text-sm"
                style={{ color: "var(--color-text)" }}
              >
                {line.category}
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: "var(--color-gold)" }}>
                  {formatInr(line.amount)} ({formatPercent(distributable > 0 ? line.amount / distributable : 0)})
                </span>
                {!readOnly && (
                  <button
                    onClick={() => handleLockToggle(i)}
                    aria-pressed={line.locked}
                    aria-label={`${line.locked ? "Unlock" : "Lock"} ${line.category}`}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm"
                  >
                    {line.locked ? "🔒" : "🔓"}
                  </button>
                )}
              </div>
            </div>
            {!readOnly && !line.locked && (
              <input
                type="range"
                id={`budget-slider-${i}`}
                min={0}
                max={distributable}
                step={100}
                value={line.amount}
                onChange={(e) => handleSliderChange(i, parseInt(e.target.value))}
                className="w-full min-h-[44px]"
                aria-label={`${line.category} amount`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
