import { Firestore } from "@google-cloud/firestore";
import type { StoredPlan } from "@/lib/contracts/plan";

const COLLECTION = "plans";

/** Firestore-backed plan store for production. */
export class FirestoreStore {
  private readonly db: Firestore;

  constructor(databaseId?: string) {
    this.db = new Firestore({
      databaseId: databaseId ?? process.env.FIRESTORE_DB ?? "utsavai",
    });
  }

  /** Creates a new plan. */
  async create(plan: StoredPlan): Promise<void> {
    await this.db.collection(COLLECTION).doc(plan.id).set({
      ...plan,
      expireAt: new Date(plan.expireAt),
    });
  }

  /** Loads a plan by ID. */
  async load(id: string): Promise<StoredPlan | null> {
    const doc = await this.db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;

    const data = doc.data() as Record<string, unknown>;
    return deserializePlan(data);
  }

  /** Atomic read-modify-write via Firestore transaction. */
  async mutate(
    id: string,
    fn: (plan: StoredPlan) => StoredPlan
  ): Promise<StoredPlan | null> {
    const ref = this.db.collection(COLLECTION).doc(id);

    return this.db.runTransaction(async (tx) => {
      const doc = await tx.get(ref);
      if (!doc.exists) return null;

      const plan = deserializePlan(doc.data() as Record<string, unknown>);
      const updated = fn(plan);

      tx.set(ref, {
        ...updated,
        expireAt: new Date(updated.expireAt),
      });

      return updated;
    });
  }
}

function deserializePlan(data: Record<string, unknown>): StoredPlan {
  const expireAt = data.expireAt;
  let expireAtStr: string;

  if (expireAt && typeof expireAt === "object" && "toDate" in expireAt) {
    expireAtStr = (expireAt as { toDate: () => Date }).toDate().toISOString();
  } else {
    expireAtStr = String(expireAt);
  }

  return { ...data, expireAt: expireAtStr } as StoredPlan;
}
