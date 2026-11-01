import { describe, it, expect } from "vitest";
import { generateIcs, escapeIcalText, foldLines } from "@/lib/engine/ical";
import type { ScheduledTask } from "@/lib/contracts/plan";

describe("escapeIcalText", () => {
  it("escapes semicolons", () => {
    expect(escapeIcalText("a;b")).toBe("a\\;b");
  });

  it("escapes commas", () => {
    expect(escapeIcalText("a,b")).toBe("a\\,b");
  });

  it("escapes backslashes", () => {
    expect(escapeIcalText("a\\b")).toBe("a\\\\b");
  });

  it("escapes newlines", () => {
    expect(escapeIcalText("a\nb")).toBe("a\\nb");
  });

  it("handles multiple escapes", () => {
    expect(escapeIcalText("a;b,c\\d\ne")).toBe("a\\;b\\,c\\\\d\\ne");
  });

  it("handles empty string", () => {
    expect(escapeIcalText("")).toBe("");
  });

  it("handles ₹ symbol (multi-byte)", () => {
    const result = escapeIcalText("₹1,000");
    expect(result).toContain("\\,");
  });

  it("handles Devanagari text", () => {
    const result = escapeIcalText("शादी; विवाह");
    expect(result).toContain("\\;");
  });
});

describe("foldLines", () => {
  it("does not fold short lines", () => {
    const result = foldLines("SHORT LINE");
    expect(result).toBe("SHORT LINE");
  });

  it("folds long lines at 75 octets", () => {
    const long = "A".repeat(100);
    const result = foldLines(long);
    const lines = result.split("\r\n");
    for (const line of lines) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it("handles multi-byte characters (₹)", () => {
    const text = "₹".repeat(30);
    const result = foldLines(text);
    const lines = result.split("\r\n");
    for (const line of lines) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });
});

describe("generateIcs", () => {
  const tasks: ScheduledTask[] = [
    { id: "t1", title: "Book venue", category: "Venue", startDate: "2025-03-01", dueDate: "2025-03-15", done: false },
    { id: "t2", title: "Order cake", category: "Food", startDate: "2025-03-10", dueDate: "2025-03-20", done: false },
    { id: "t3", title: "Done task", category: "Done", startDate: "2025-01-01", dueDate: "2025-01-15", done: true },
  ];

  it("generates valid VCALENDAR", () => {
    const ics = generateIcs(tasks, "Wedding", "2025-03-25");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("contains VERSION", () => {
    const ics = generateIcs(tasks, "Wedding", "2025-03-25");
    expect(ics).toContain("VERSION:2.0");
  });

  it("contains PRODID", () => {
    const ics = generateIcs(tasks, "Wedding", "2025-03-25");
    expect(ics).toContain("PRODID:");
  });

  it("includes only incomplete tasks", () => {
    const ics = generateIcs(tasks, "Wedding", "2025-03-25");
    expect(ics).toContain("Book venue");
    expect(ics).toContain("Order cake");
    expect(ics).not.toContain("Done task");
  });

  it("has VEVENT for each incomplete task", () => {
    const ics = generateIcs(tasks, "Wedding", "2025-03-25");
    const eventCount = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
    expect(eventCount).toBe(2);
  });

  it("has DTSTART and DTEND", () => {
    const ics = generateIcs(tasks, "Wedding", "2025-03-25");
    expect(ics).toContain("DTSTART;VALUE=DATE:20250301");
    expect(ics).toContain("DTEND;VALUE=DATE:20250315");
  });

  it("has UID per event", () => {
    const ics = generateIcs(tasks, "Wedding", "2025-03-25");
    expect(ics).toContain("UID:t1-2025-03-25@");
    expect(ics).toContain("UID:t2-2025-03-25@");
  });

  it("has CATEGORIES", () => {
    const ics = generateIcs(tasks, "Wedding", "2025-03-25");
    expect(ics).toContain("CATEGORIES:Venue");
    expect(ics).toContain("CATEGORIES:Food");
  });

  it("has CALNAME", () => {
    const ics = generateIcs(tasks, "Wedding", "2025-03-25");
    expect(ics).toContain("X-WR-CALNAME:Wedding");
  });

  it("uses CRLF line endings", () => {
    const ics = generateIcs(tasks, "Wedding", "2025-03-25");
    expect(ics).toContain("\r\n");
  });

  it("handles empty task list", () => {
    const ics = generateIcs([], "Wedding", "2025-03-25");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).not.toContain("BEGIN:VEVENT");
  });

  it("handles all tasks done", () => {
    const allDone = tasks.map((t) => ({ ...t, done: true }));
    const ics = generateIcs(allDone, "Wedding", "2025-03-25");
    expect(ics).not.toContain("BEGIN:VEVENT");
  });
});
