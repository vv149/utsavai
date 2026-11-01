"use client";

import type { ScheduledTask } from "@/lib/contracts/plan";
import { formatDateLabel } from "@/lib/engine/format";
import { isOverdue } from "@/lib/engine/schedule";

/** Timeline tab showing tasks with checkboxes. */
export function TimelineTab({
  tasks,
  eventDate,
  readOnly,
  onToggleTask,
}: {
  tasks: readonly ScheduledTask[];
  eventDate: string;
  readOnly: boolean;
  onToggleTask: (id: string) => void;
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold" style={{ color: "var(--color-gold)" }}>
        Timeline
      </h2>
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Event: {formatDateLabel(eventDate)}
      </p>

      <ul className="space-y-2" role="list" aria-label="Tasks">
        {tasks.map((task) => {
          const overdue = isOverdue(task, today);
          return (
            <li
              key={task.id}
              className="rounded-lg p-4 flex items-start gap-3"
              style={{ backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
            >
              <input
                type="checkbox"
                checked={task.done}
                disabled={readOnly}
                onChange={() => onToggleTask(task.id)}
                aria-label={`Mark "${task.title}" as ${task.done ? "incomplete" : "complete"}`}
                className="mt-1 min-w-[20px] min-h-[20px]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`font-medium ${task.done ? "line-through" : ""}`}
                    style={{ color: task.done ? "var(--color-text-muted)" : "var(--color-text)" }}
                  >
                    {task.title}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ backgroundColor: "var(--color-bg-input)", color: "var(--color-text-muted)" }}
                  >
                    {task.category}
                  </span>
                  {overdue && (
                    <span
                      className="text-xs px-2 py-0.5 rounded font-medium"
                      style={{ backgroundColor: "rgba(239,68,68,0.2)", color: "var(--color-error)" }}
                    >
                      Overdue
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                  {formatDateLabel(task.startDate)} → {formatDateLabel(task.dueDate)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
