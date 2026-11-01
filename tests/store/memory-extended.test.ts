import { describe, it, expect, beforeEach } from "vitest";
import { MemoryStore } from "@/lib/store/memory";
import type { StoredPlan } from "@/lib/contracts/plan";

function makePlan(id: string = "test-1"): StoredPlan {
  return {
    id,
    brief: { eventType: "wedding", date: "2025-12-31", city: "Mumbai", guests: 200, budgetInr: 500000, language: "en", brief: "" },
    summary: "Grand wedding plan",
    ideas: [],
    budget: [],
    contingency: 50000,
    tasks: [],
    vendorSuggestions: [],
    vendorPlaces: {},
    tips: [],
    editKeyHash: "abc123",
    createdAt: new Date().toISOString(),
    expireAt: new Date(Date.now() + 180 * 86400000).toISOString(),
    templateFallback: false,
  };
}

describe("MemoryStore extended", () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  it("create stores plan", async () => {
    const plan = makePlan();
    await store.create(plan);
    const loaded = await store.load("test-1");
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe("test-1");
  });

  it("load returns null for missing id", async () => {
    expect(await store.load("nonexistent")).toBeNull();
  });

  it("load returns stored plan", async () => {
    const plan = makePlan("load-test");
    await store.create(plan);
    const loaded = await store.load("load-test");
    expect(loaded).not.toBeNull();
    expect(loaded!.id).toBe("load-test");
  });

  it("mutate updates plan", async () => {
    const plan = makePlan("mutate-test");
    await store.create(plan);
    await store.mutate("mutate-test", (p) => {
      p.summary = "Updated summary";
      return p;
    });
    const loaded = await store.load("mutate-test");
    expect(loaded!.summary).toBe("Updated summary");
  });

  it("multiple plans coexist", async () => {
    await store.create(makePlan("p1"));
    await store.create(makePlan("p2"));
    await store.create(makePlan("p3"));
    expect(await store.load("p1")).not.toBeNull();
    expect(await store.load("p2")).not.toBeNull();
    expect(await store.load("p3")).not.toBeNull();
  });

  it("clear removes all plans", async () => {
    await store.create(makePlan("c1"));
    await store.create(makePlan("c2"));
    store.clear();
    expect(await store.load("c1")).toBeNull();
    expect(await store.load("c2")).toBeNull();
  });

  it("load returns deep clone (not reference)", async () => {
    const plan = makePlan("clone-test");
    await store.create(plan);
    const a = await store.load("clone-test");
    const b = await store.load("clone-test");
    expect(a).not.toBe(b);
    a!.summary = "modified";
    expect((await store.load("clone-test"))!.summary).toBe("Grand wedding plan");
  });

  it("10 concurrent creates succeed", async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      store.create(makePlan(`concurrent-${i}`))
    );
    await Promise.all(promises);
    for (let i = 0; i < 10; i++) {
      expect(await store.load(`concurrent-${i}`)).not.toBeNull();
    }
  });

  it("preserves all plan fields", async () => {
    const plan = makePlan("fields-test");
    plan.tips = ["tip1", "tip2"];
    plan.contingency = 25000;
    await store.create(plan);
    const loaded = await store.load("fields-test");
    expect(loaded!.tips).toEqual(["tip1", "tip2"]);
    expect(loaded!.contingency).toBe(25000);
  });
});
