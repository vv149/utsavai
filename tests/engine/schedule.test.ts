import { describe, it, expect } from "vitest";
import { topologicalSort, scheduleTasks, isOverdue } from "@/lib/engine/schedule";
import type { Task, ScheduledTask } from "@/lib/contracts/plan";

describe("topologicalSort", () => {
  it("sorts tasks by dependencies", () => {
    const tasks: Task[] = [
      { id: "t2", title: "B", category: "C", leadDays: 30, depends: ["t1"] },
      { id: "t1", title: "A", category: "C", leadDays: 60, depends: [] },
    ];
    const sorted = topologicalSort(tasks);
    expect(sorted[0].id).toBe("t1");
    expect(sorted[1].id).toBe("t2");
  });

  it("handles no dependencies", () => {
    const tasks: Task[] = [
      { id: "t1", title: "A", category: "C", leadDays: 10, depends: [] },
      { id: "t2", title: "B", category: "C", leadDays: 20, depends: [] },
    ];
    const sorted = topologicalSort(tasks);
    expect(sorted).toHaveLength(2);
  });

  it("detects cycles and falls back to flat list by leadDays desc", () => {
    const tasks: Task[] = [
      { id: "t1", title: "A", category: "C", leadDays: 10, depends: ["t2"] },
      { id: "t2", title: "B", category: "C", leadDays: 20, depends: ["t1"] },
    ];
    const sorted = topologicalSort(tasks);
    expect(sorted).toHaveLength(2);
    expect(sorted[0].leadDays).toBeGreaterThanOrEqual(sorted[1].leadDays);
  });

  it("ignores missing dependency IDs", () => {
    const tasks: Task[] = [
      { id: "t1", title: "A", category: "C", leadDays: 10, depends: ["missing"] },
    ];
    const sorted = topologicalSort(tasks);
    expect(sorted).toHaveLength(1);
  });

  it("handles diamond dependencies", () => {
    const tasks: Task[] = [
      { id: "t1", title: "A", category: "C", leadDays: 90, depends: [] },
      { id: "t2", title: "B", category: "C", leadDays: 60, depends: ["t1"] },
      { id: "t3", title: "C", category: "C", leadDays: 60, depends: ["t1"] },
      { id: "t4", title: "D", category: "C", leadDays: 30, depends: ["t2", "t3"] },
    ];
    const sorted = topologicalSort(tasks);
    const idxT1 = sorted.findIndex((t) => t.id === "t1");
    const idxT4 = sorted.findIndex((t) => t.id === "t4");
    expect(idxT1).toBeLessThan(idxT4);
  });

  it("handles single task", () => {
    const sorted = topologicalSort([
      { id: "t1", title: "A", category: "C", leadDays: 10, depends: [] },
    ]);
    expect(sorted).toHaveLength(1);
  });

  it("handles empty input", () => {
    expect(topologicalSort([])).toHaveLength(0);
  });

  it("handles chain of 5 tasks", () => {
    const tasks: Task[] = Array.from({ length: 5 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      category: "C",
      leadDays: (5 - i) * 10,
      depends: i > 0 ? [`t${i - 1}`] : [],
    }));
    const sorted = topologicalSort(tasks);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted.findIndex((t) => t.id === `t${i - 1}`);
      const curr = sorted.findIndex((t) => t.id === `t${i}`);
      expect(prev).toBeLessThan(curr);
    }
  });
});

describe("scheduleTasks", () => {
  const baseTasks: Task[] = [
    { id: "t1", title: "Book venue", category: "Venue", leadDays: 90, depends: [] },
    { id: "t2", title: "Hire caterer", category: "Food", leadDays: 60, depends: [] },
    { id: "t3", title: "Final check", category: "Venue", leadDays: 3, depends: [] },
  ];

  it("computes dates relative to event", () => {
    const scheduled = scheduleTasks(baseTasks, "2025-06-01", "2025-01-01");
    expect(scheduled).toHaveLength(3);
    for (const t of scheduled) {
      expect(t.startDate).toBeTruthy();
      expect(t.dueDate).toBeTruthy();
      expect(t.done).toBe(false);
    }
  });

  it("compresses timeline when event is soon", () => {
    const scheduled = scheduleTasks(baseTasks, "2025-01-15", "2025-01-10");
    expect(scheduled).toHaveLength(3);
    // Due dates should be clamped to no earlier than today
    for (const t of scheduled) {
      expect(t.dueDate >= "2025-01-10").toBe(true);
    }
  });

  it("handles event today", () => {
    const scheduled = scheduleTasks(baseTasks, "2025-03-01", "2025-03-01");
    expect(scheduled).toHaveLength(3);
  });

  it("handles past event", () => {
    const scheduled = scheduleTasks(baseTasks, "2024-01-01", "2025-01-01");
    expect(scheduled).toHaveLength(3);
  });

  it("all tasks start as not done", () => {
    const scheduled = scheduleTasks(baseTasks, "2025-12-01", "2025-01-01");
    expect(scheduled.every((t) => t.done === false)).toBe(true);
  });

  it("preserves task IDs and titles", () => {
    const scheduled = scheduleTasks(baseTasks, "2025-06-01", "2025-01-01");
    expect(scheduled[0].id).toBe("t1");
    expect(scheduled[0].title).toBe("Book venue");
  });
});

describe("isOverdue", () => {
  it("returns true for overdue incomplete task", () => {
    const task: ScheduledTask = {
      id: "t1",
      title: "Test",
      category: "C",
      startDate: "2025-01-01",
      dueDate: "2025-01-15",
      done: false,
    };
    expect(isOverdue(task, "2025-01-16")).toBe(true);
  });

  it("returns false for completed task even if past due", () => {
    const task: ScheduledTask = {
      id: "t1",
      title: "Test",
      category: "C",
      startDate: "2025-01-01",
      dueDate: "2025-01-15",
      done: true,
    };
    expect(isOverdue(task, "2025-01-16")).toBe(false);
  });

  it("returns false for task not yet due", () => {
    const task: ScheduledTask = {
      id: "t1",
      title: "Test",
      category: "C",
      startDate: "2025-01-01",
      dueDate: "2025-01-15",
      done: false,
    };
    expect(isOverdue(task, "2025-01-14")).toBe(false);
  });

  it("returns false for task due today", () => {
    const task: ScheduledTask = {
      id: "t1",
      title: "Test",
      category: "C",
      startDate: "2025-01-01",
      dueDate: "2025-01-15",
      done: false,
    };
    expect(isOverdue(task, "2025-01-15")).toBe(false);
  });
});
