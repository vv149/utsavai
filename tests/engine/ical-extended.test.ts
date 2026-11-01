import { describe, it, expect } from "vitest";
import { generateIcs, escapeIcalText, foldLines } from "@/lib/engine/ical";
import type { ScheduledTask } from "@/lib/contracts/plan";

describe("escapeIcalText extended", () => {
  it("handles carriage return", () => {
    expect(escapeIcalText("a\rb")).toContain("a");
  });

  it("handles tab", () => {
    expect(escapeIcalText("a\tb")).toBe("a\tb");
  });

  it("handles long strings", () => {
    const long = "Hello; world, foo\\bar\n".repeat(100);
    const escaped = escapeIcalText(long);
    expect(escaped).toContain("\\;");
    expect(escaped).toContain("\\,");
  });

  it("handles emoji", () => {
    const result = escapeIcalText("Party 🎉; fun");
    expect(result).toContain("\\;");
    expect(result).toContain("🎉");
  });

  it("handles Hindi text with semicolons", () => {
    expect(escapeIcalText("मेहंदी; संगीत")).toContain("\\;");
  });
});

describe("foldLines extended", () => {
  it("handles empty string", () => {
    expect(foldLines("")).toBe("");
  });

  it("handles exactly 75 bytes", () => {
    const line = "A".repeat(75);
    const result = foldLines(line);
    expect(result).toBe(line);
  });

  it("handles 76 bytes", () => {
    const line = "A".repeat(76);
    const result = foldLines(line);
    expect(result).toContain("\r\n");
  });

  it("handles Hindi text folding", () => {
    const text = "शादी की तैयारी ".repeat(10);
    const result = foldLines(text);
    const lines = result.split("\r\n");
    for (const line of lines) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });
});

describe("generateIcs extended", () => {
  it("handles 20 tasks", () => {
    const tasks: ScheduledTask[] = Array.from({ length: 20 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      category: `Cat${i % 3}`,
      startDate: "2025-03-01",
      dueDate: "2025-03-15",
      done: i % 3 === 0,
    }));
    const ics = generateIcs(tasks, "Big Event", "2025-04-01");
    const incomplete = tasks.filter((t) => !t.done).length;
    const eventCount = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
    expect(eventCount).toBe(incomplete);
  });

  it("handles special chars in event name", () => {
    const tasks: ScheduledTask[] = [{
      id: "t1",
      title: "Test",
      category: "C",
      startDate: "2025-01-01",
      dueDate: "2025-02-01",
      done: false,
    }];
    const ics = generateIcs(tasks, "Sharma; Wedding, 2025", "2025-03-01");
    expect(ics).toContain("BEGIN:VCALENDAR");
  });

  it("single task generates single VEVENT", () => {
    const tasks: ScheduledTask[] = [{
      id: "solo",
      title: "Only task",
      category: "Main",
      startDate: "2025-06-01",
      dueDate: "2025-06-15",
      done: false,
    }];
    const ics = generateIcs(tasks, "Solo", "2025-07-01");
    expect((ics.match(/BEGIN:VEVENT/g) ?? []).length).toBe(1);
    expect((ics.match(/END:VEVENT/g) ?? []).length).toBe(1);
  });

  it("UID is unique per task", () => {
    const tasks: ScheduledTask[] = Array.from({ length: 5 }, (_, i) => ({
      id: `unique${i}`,
      title: `T${i}`,
      category: "C",
      startDate: "2025-01-01",
      dueDate: "2025-02-01",
      done: false,
    }));
    const ics = generateIcs(tasks, "Test", "2025-03-01");
    for (let i = 0; i < 5; i++) {
      expect(ics).toContain(`UID:unique${i}-`);
    }
  });
});
