"use client";

import type { StoredPlan } from "@/lib/contracts/plan";
import { formatInr, formatDateLabel, countdownLabel } from "@/lib/engine/format";

/** Overview tab showing plan summary and key metrics. */
export function OverviewTab({ plan }: { plan: StoredPlan }) {
  const today = new Date().toISOString().slice(0, 10);
  const countdown = countdownLabel(plan.brief.date, today);
  const completedTasks = plan.tasks.filter((t) => t.done).length;

  return (
    <div className="space-y-6">
      <section aria-label="Event summary">
        <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--color-gold)" }}>
          Summary
        </h2>
        <p style={{ color: "var(--color-text)" }}>{plan.summary}</p>
        {plan.templateFallback && (
          <p className="text-sm mt-2 italic" style={{ color: "var(--color-text-muted)" }}>
            This plan was generated using our template system.
          </p>
        )}
      </section>

      <section aria-label="Key details" className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard label="Event Date" value={formatDateLabel(plan.brief.date)} />
        <MetricCard label="Countdown" value={countdown} />
        <MetricCard label="Guests" value={String(plan.brief.guests)} />
        <MetricCard label="Budget" value={formatInr(plan.brief.budgetInr)} />
      </section>

      <section aria-label="Progress">
        <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--color-gold)" }}>
          Progress
        </h2>
        <div className="flex items-center gap-3">
          <div
            className="flex-1 h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: "var(--color-bg-input)" }}
            role="progressbar"
            aria-valuenow={completedTasks}
            aria-valuemin={0}
            aria-valuemax={plan.tasks.length}
            aria-label="Task completion"
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${plan.tasks.length > 0 ? (completedTasks / plan.tasks.length) * 100 : 0}%`,
                backgroundColor: "var(--color-success)",
              }}
            />
          </div>
          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            {completedTasks}/{plan.tasks.length} tasks
          </span>
        </div>
      </section>

      {plan.tips.length > 0 && (
        <section aria-label="Tips">
          <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--color-gold)" }}>
            Tips
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            {plan.tips.map((tip, i) => (
              <li key={i} style={{ color: "var(--color-text)" }}>{tip}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg p-4"
      style={{ backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
    >
      <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>{label}</p>
      <p className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>{value}</p>
    </div>
  );
}
