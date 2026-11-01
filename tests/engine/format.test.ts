import { describe, it, expect } from "vitest";
import {
  formatInr,
  formatIndianNumber,
  formatDateLabel,
  countdownLabel,
  formatPercent,
} from "@/lib/engine/format";

describe("formatInr", () => {
  it("formats small amounts", () => {
    expect(formatInr(1000)).toContain("1,000");
  });

  it("formats lakhs", () => {
    const result = formatInr(100_000);
    expect(result).toContain("1,00,000");
  });

  it("formats crores", () => {
    const result = formatInr(10_000_000);
    expect(result).toContain("1,00,00,000");
  });

  it("includes rupee symbol", () => {
    expect(formatInr(1000)).toContain("₹");
  });

  it("handles zero", () => {
    expect(formatInr(0)).toContain("0");
  });

  it("has no decimal places", () => {
    expect(formatInr(1234)).not.toContain(".");
  });
});

describe("formatIndianNumber", () => {
  it("formats with Indian grouping", () => {
    expect(formatIndianNumber(100_000)).toContain("1,00,000");
  });

  it("handles small numbers", () => {
    expect(formatIndianNumber(42)).toBe("42");
  });
});

describe("formatDateLabel", () => {
  it("formats date correctly", () => {
    const result = formatDateLabel("2025-03-15");
    expect(result).toContain("15");
    expect(result).toContain("Mar");
    expect(result).toContain("2025");
  });

  it("handles January", () => {
    const result = formatDateLabel("2025-01-01");
    expect(result).toContain("Jan");
  });

  it("handles December", () => {
    const result = formatDateLabel("2025-12-31");
    expect(result).toContain("Dec");
  });
});

describe("countdownLabel", () => {
  it("returns 'Today' for same date", () => {
    expect(countdownLabel("2025-03-15", "2025-03-15")).toBe("Today");
  });

  it("returns 'Tomorrow' for next day", () => {
    expect(countdownLabel("2025-03-16", "2025-03-15")).toBe("Tomorrow");
  });

  it("returns 'Celebrated' for past date", () => {
    expect(countdownLabel("2025-03-10", "2025-03-15")).toBe("Celebrated");
  });

  it("returns days count for future", () => {
    expect(countdownLabel("2025-03-20", "2025-03-15")).toBe("5 days to go");
  });

  it("handles large gap", () => {
    const result = countdownLabel("2025-12-31", "2025-01-01");
    expect(result).toContain("days to go");
  });
});

describe("formatPercent", () => {
  it("formats 100%", () => {
    expect(formatPercent(1)).toBe("100.0%");
  });

  it("formats 50%", () => {
    expect(formatPercent(0.5)).toBe("50.0%");
  });

  it("formats 0%", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });

  it("formats with one decimal", () => {
    expect(formatPercent(0.333)).toBe("33.3%");
  });
});
