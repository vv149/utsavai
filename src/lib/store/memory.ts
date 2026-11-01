import type { StoredPlan } from "@/lib/contracts/plan";

/** In-memory plan store for development and testing. */
export class MemoryStore {
  private readonly plans = new Map<string, StoredPlan>();
  private mutating = new Set<string>();

  /** Creates a new plan. */
  async create(plan: StoredPlan): Promise<void> {
    this.plans.set(plan.id, structuredClone(plan));
  }

  /** Loads a plan by ID. Returns null if not found or expired. */
  async load(id: string): Promise<StoredPlan | null> {
    const plan = this.plans.get(id);
    if (!plan) return null;

    if (new Date(plan.expireAt) < new Date()) {
      this.plans.delete(id);
      return null;
    }

    return structuredClone(plan);
  }

  /** Atomic read-modify-write. Prevents concurrent mutations on the same plan. */
  async mutate(
    id: string,
    fn: (plan: StoredPlan) => StoredPlan
  ): Promise<StoredPlan | null> {
    // ponytail: spin-wait for concurrent access on same key
    while (this.mutating.has(id)) {
      await new Promise((r) => setTimeout(r, 1));
    }

    this.mutating.add(id);
    try {
      const plan = this.plans.get(id);
      if (!plan) return null;

      const updated = fn(structuredClone(plan));
      this.plans.set(id, updated);
      return structuredClone(updated);
    } finally {
      this.mutating.delete(id);
    }
  }

  /** Clears all plans (for testing). */
  clear(): void {
    this.plans.clear();
  }
}
