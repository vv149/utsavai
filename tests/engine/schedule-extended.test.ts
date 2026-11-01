import { describe, it, expect } from "vitest";
import { topologicalSort, scheduleTasks, isOverdue } from "@/lib/engine/schedule";
import type { Task, ScheduledTask } from "@/lib/contracts/plan";

describe("topologicalSort extended", () => {
  it("handles 20 independent tasks", () => {
    const tasks: Task[] = Array.from({ length: 20 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      category: "C",
      leadDays: i * 5,
      depends: [],
    }));
    expect(topologicalSort(tasks)).toHaveLength(20);
  });

  it("handles deep chain of 10", () => {
    const tasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      category: "C",
      leadDays: (10 - i) * 10,
      depends: i > 0 ? [`t${i - 1}`] : [],
    }));
    const sorted = topologicalSort(tasks);
    expect(sorted[0].id).toBe("t0");
    expect(sorted[9].id).toBe("t9");
  });

  it("self-dependency treated as cycle", () => {
    const tasks: Task[] = [
      { id: "t1", title: "A", category: "C", leadDays: 10, depends: ["t1"] },
    ];
    const sorted = topologicalSort(tasks);
    expect(sorted).toHaveLength(1);
  });

  it("preserves all task properties", () => {
    const task: Task = {
      id: "t1",
      title: "My Task",
      category: "Venue",
      leadDays: 42,
      depends: [],
    };
    const sorted = topologicalSort([task]);
    expect(sorted[0].title).toBe("My Task");
    expect(sorted[0].category).toBe("Venue");
    expect(sorted[0].leadDays).toBe(42);
  });

  it("fan-out: one task depended on by many", () => {
    const tasks: Task[] = [
      { id: "root", title: "Root", category: "C", leadDays: 90, depends: [] },
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `leaf${i}`,
        title: `Leaf ${i}`,
        category: "C",
        leadDays: 30,
        depends: ["root"],
      })),
    ];
    const sorted = topologicalSort(tasks);
    expect(sorted[0].id).toBe("root");
  });

  it("fan-in: many deps into one task", () => {
    const tasks: Task[] = [
      ...Array.from({ length: 3 }, (_, i) => ({
        id: `src${i}`,
        title: `Src ${i}`,
        category: "C",
        leadDays: 60,
        depends: [] as string[],
      })),
      { id: "sink", title: "Sink", category: "C", leadDays: 10, depends: ["src0", "src1", "src2"] },
    ];
    const sorted = topologicalSort(tasks);
    const sinkIdx = sorted.findIndex((t) => t.id === "sink");
    expect(sinkIdx).toBe(3);
  });
});

describe("scheduleTasks extended", () => {
  it("handles 20 tasks", () => {
    const tasks: Task[] = Array.from({ length: 20 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      category: "C",
      leadDays: i * 5,
      depends: [],
    }));
    const scheduled = scheduleTasks(tasks, "2025-12-31", "2025-01-01");
    expect(scheduled).toHaveLength(20);
    scheduled.forEach((t) => {
      expect(t.startDate).toBeTruthy();
      expect(t.dueDate).toBeTruthy();
    });
  });

  it("earlier leadDays get later start dates", () => {
    const tasks: Task[] = [
      { id: "t1", title: "A", category: "C", leadDays: 90, depends: [] },
      { id: "t2", title: "B", category: "C", leadDays: 30, depends: [] },
    ];
    const scheduled = scheduleTasks(tasks, "2025-12-31", "2025-01-01");
    expect(scheduled[0].startDate <= scheduled[1].startDate).toBe(true);
  });

  it("all tasks have string dates", () => {
    const tasks: Task[] = [
      { id: "t1", title: "A", category: "C", leadDays: 10, depends: [] },
    ];
    const scheduled = scheduleTasks(tasks, "2025-06-01", "2025-01-01");
    expect(typeof scheduled[0].startDate).toBe("string");
    expect(typeof scheduled[0].dueDate).toBe("string");
  });
});

describe("isOverdue extended", () => {
  const makeTask = (dueDate: string, done: boolean): ScheduledTask => ({
    id: "t1",
    title: "Test",
    category: "C",
    startDate: "2025-01-01",
    dueDate,
    done,
  });

  it("yesterday overdue if not done", () => {
    expect(isOverdue(makeTask("2025-03-14", false), "2025-03-15")).toBe(true);
  });

  it("yesterday not overdue if done", () => {
    expect(isOverdue(makeTask("2025-03-14", true), "2025-03-15")).toBe(false);
  });

  it("tomorrow not overdue", () => {
    expect(isOverdue(makeTask("2025-03-16", false), "2025-03-15")).toBe(false);
  });

  it("way past due is overdue", () => {
    expect(isOverdue(makeTask("2024-01-01", false), "2025-12-31")).toBe(true);
  });

  it("way future not overdue", () => {
    expect(isOverdue(makeTask("2030-01-01", false), "2025-01-01")).toBe(false);
  });
});
