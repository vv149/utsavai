import type { StoredPlan } from "@/lib/contracts/plan";

/** Interface for plan persistence. */
export interface PlanStore {
  create(plan: StoredPlan): Promise<void>;
  load(id: string): Promise<StoredPlan | null>;
  mutate(id: string, fn: (plan: StoredPlan) => StoredPlan): Promise<StoredPlan | null>;
}

export { MemoryStore } from "./memory";
export { FirestoreStore } from "./firestore";
