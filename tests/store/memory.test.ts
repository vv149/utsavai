import { describe, it, expect, beforeEach } from "vitest";
import { MemoryStore } from "@/lib/store/memory";
import type { StoredPlan } from "@/lib/contracts/plan";

function makePlan(overrides: Partial<StoredPlan> = {}): StoredPlan {
  return {
    id: "test-id",
    editKeyHash: "abc123",
    brief: {
      eventType: "wedding",
      date: "2025-06-15",
      city: "Mumbai",
      guests: 200,
      budgetInr: 500_000,
      brief: "",
      language: "en",
    },
    summary: "Test plan",
    ideas: [{
      name: "Theme",
      concept: "A concept",
      palette: ["#fff"],
      decor: ["Flowers"],
      food: ["Biryani"],
      music: ["DJ"],
      signatureMoment: "Dance",
    }],
    budget: [
      { category: "Venue", amount: 200_000, locked: false },
      { category: "Food", amount: 250_000, locked: false },
    ],
    contingency: 50_000,
    tasks: [{
      id: "t1",
      title: "Book venue",
      category: "Venue",
      startDate: "2025-01-01",
      dueDate: "2025-03-01",
      done: false,
    }],
    vendorSuggestions: [{
      category: "Venue",
      query: "venue Mumbai",
      tips: ["Check reviews"],
    }],
    vendorPlaces: {},
    tips: ["Book early"],
    createdAt: new Date().toISOString(),
    expireAt: new Date(Date.now() + 180 * 86400_000).toISOString(),
    templateFallback: false,
    ...overrides,
  };
}

describe("MemoryStore", () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  it("creates and loads a plan", async () => {
    const plan = makePlan();
    await store.create(plan);
    const loaded = await store.load("test-id");
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe("test-id");
  });

  it("returns null for missing ID", async () => {
    expect(await store.load("nonexistent")).toBeNull();
  });

  it("returns null for expired plan", async () => {
    const plan = makePlan({ expireAt: new Date(Date.now() - 1000).toISOString() });
    await store.create(plan);
    expect(await store.load("test-id")).toBeNull();
  });

  it("mutates a plan", async () => {
    await store.create(makePlan());
    const updated = await store.mutate("test-id", (p) => ({
      ...p,
      summary: "Updated",
    }));
    expect(updated!.summary).toBe("Updated");
  });

  it("mutate returns null for missing ID", async () => {
    expect(await store.mutate("missing", (p) => p)).toBeNull();
  });

  it("returns clones (not references)", async () => {
    await store.create(makePlan());
    const a = await store.load("test-id");
    const b = await store.load("test-id");
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it("clears all plans", async () => {
    await store.create(makePlan());
    store.clear();
    expect(await store.load("test-id")).toBeNull();
  });

  it("handles concurrent mutations safely", async () => {
    await store.create(makePlan());
    const results = await Promise.all([
      store.mutate("test-id", (p) => ({ ...p, summary: "A" })),
      store.mutate("test-id", (p) => ({ ...p, summary: "B" })),
    ]);
    expect(results.every((r) => r !== null)).toBe(true);
    const final = await store.load("test-id");
    expect(["A", "B"]).toContain(final!.summary);
  });
});
