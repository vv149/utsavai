import { describe, it, expect } from "vitest";
import {
  formatInr,
  formatIndianNumber,
  formatDateLabel,
  countdownLabel,
  formatPercent,
} from "@/lib/engine/format";

describe("formatInr extended", () => {
  const cases: [number, string][] = [
    [1, "1"],
    [100, "100"],
    [999, "999"],
    [10_000, "10,000"],
    [1_00_000, "1,00,000"],
    [10_00_000, "10,00,000"],
    [1_00_00_000, "1,00,00,000"],
  ];

  for (const [amount, expected] of cases) {
    it(`formats ${amount} correctly`, () => {
      expect(formatInr(amount)).toContain(expected);
    });
  }

  it("always starts with ₹", () => {
    for (const n of [0, 1, 100, 1000, 100_000, 10_000_000]) {
      expect(formatInr(n).startsWith("₹")).toBe(true);
    }
  });
});

describe("formatIndianNumber extended", () => {
  it("formats 0", () => {
    expect(formatIndianNumber(0)).toBe("0");
  });

  it("formats 1000", () => {
    expect(formatIndianNumber(1000)).toContain("1,000");
  });

  it("formats 10 lakh", () => {
    expect(formatIndianNumber(1_000_000)).toContain("10,00,000");
  });
});

describe("formatDateLabel extended", () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  for (let m = 0; m < 12; m++) {
    const mm = String(m + 1).padStart(2, "0");
    it(`formats month ${months[m]}`, () => {
      const result = formatDateLabel(`2025-${mm}-15`);
      expect(result).toContain(months[m]);
    });
  }
});

describe("countdownLabel extended", () => {
  it("2 days to go", () => {
    expect(countdownLabel("2025-03-17", "2025-03-15")).toBe("2 days to go");
  });

  it("10 days to go", () => {
    expect(countdownLabel("2025-03-25", "2025-03-15")).toBe("10 days to go");
  });

  it("365 days to go", () => {
    expect(countdownLabel("2026-03-15", "2025-03-15")).toBe("365 days to go");
  });

  it("yesterday is celebrated", () => {
    expect(countdownLabel("2025-03-14", "2025-03-15")).toBe("Celebrated");
  });
});

describe("formatPercent extended", () => {
  it("0.1 = 10.0%", () => {
    expect(formatPercent(0.1)).toBe("10.0%");
  });

  it("0.25 = 25.0%", () => {
    expect(formatPercent(0.25)).toBe("25.0%");
  });

  it("0.999 = 99.9%", () => {
    expect(formatPercent(0.999)).toBe("99.9%");
  });

  it("0.001 = 0.1%", () => {
    expect(formatPercent(0.001)).toBe("0.1%");
  });

  it("2.0 = 200.0%", () => {
    expect(formatPercent(2.0)).toBe("200.0%");
  });
});
