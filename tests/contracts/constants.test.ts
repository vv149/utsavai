import { describe, it, expect } from "vitest";
import {
  EVENT_PRESETS,
  INDIAN_CITIES,
  PLAN_TABS,
  AUTOSAVE_DELAY_MS,
  APP_NAME,
  APP_TAGLINE,
} from "@/lib/contracts/constants";

describe("EVENT_PRESETS", () => {
  it("has 8 presets", () => {
    expect(EVENT_PRESETS).toHaveLength(8);
  });

  it("each has label and value", () => {
    for (const preset of EVENT_PRESETS) {
      expect(preset.label).toBeTruthy();
      expect(preset.value).toBeTruthy();
    }
  });

  it("includes wedding", () => {
    expect(EVENT_PRESETS.some((p) => p.value === "wedding")).toBe(true);
  });

  it("includes birthday", () => {
    expect(EVENT_PRESETS.some((p) => p.value === "birthday")).toBe(true);
  });

  it("includes puja", () => {
    expect(EVENT_PRESETS.some((p) => p.value === "puja")).toBe(true);
  });
});

describe("INDIAN_CITIES", () => {
  it("has 15 cities", () => {
    expect(INDIAN_CITIES).toHaveLength(15);
  });

  it("includes Mumbai", () => {
    expect(INDIAN_CITIES).toContain("Mumbai");
  });

  it("includes Delhi", () => {
    expect(INDIAN_CITIES).toContain("Delhi");
  });

  it("all are unique", () => {
    expect(new Set(INDIAN_CITIES).size).toBe(INDIAN_CITIES.length);
  });
});

describe("PLAN_TABS", () => {
  it("has 7 tabs", () => {
    expect(PLAN_TABS).toHaveLength(7);
  });

  it("starts with overview", () => {
    expect(PLAN_TABS[0]).toBe("overview");
  });

  it("ends with share", () => {
    expect(PLAN_TABS[PLAN_TABS.length - 1]).toBe("share");
  });

  it("includes budget", () => {
    expect(PLAN_TABS).toContain("budget");
  });
});

describe("constants", () => {
  it("AUTOSAVE_DELAY_MS is 2000", () => {
    expect(AUTOSAVE_DELAY_MS).toBe(2000);
  });

  it("APP_NAME is UtsavAI", () => {
    expect(APP_NAME).toBe("UtsavAI");
  });

  it("APP_TAGLINE is set", () => {
    expect(APP_TAGLINE).toBeTruthy();
  });
});
