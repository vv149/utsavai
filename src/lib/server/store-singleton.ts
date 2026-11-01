import type { PlanStore } from "@/lib/store";
import { MemoryStore, FirestoreStore } from "@/lib/store";

let store: PlanStore | null = null;

/** Firestore when GOOGLE_CLOUD_PROJECT is set, otherwise in-memory. */
export function getStore(): PlanStore {
  if (store) return store;

  if (process.env.GOOGLE_CLOUD_PROJECT?.trim()) {
    store = new FirestoreStore(process.env.FIRESTORE_DATABASE ?? "utsavai");
  } else {
    store = new MemoryStore();
  }

  return store;
}

/** Resets the store singleton (for testing). */
export function resetStore(): void {
  store = null;
}
