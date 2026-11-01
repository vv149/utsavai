import type { PlanStore } from "@/lib/store";
import type { Brief, BudgetLine, StoredPlan } from "@/lib/contracts/plan";
import { generatePlan } from "@/lib/ai/plan";
import { allocateBudget, scheduleTasks, topologicalSort, validateBudgetSum, computeContingency } from "@/lib/engine/index";
import { generateEditKey } from "@/lib/security/edit-key";

/** Creates a new plan: AI ideates, engine calculates. */
export async function createPlan(
  store: PlanStore,
  brief: Brief,
  today: string
): Promise<{ plan: StoredPlan; editKey: string }> {
  const { plan: aiPlan, templateFallback } = await generatePlan(brief);

  const { lines, contingency } = allocateBudget(brief.budgetInr, aiPlan.budgetWeights);
  const sorted = topologicalSort(aiPlan.tasks);
  const scheduled = scheduleTasks(sorted, brief.date, today);
  const { key: editKey, hash: editKeyHash } = generateEditKey();

  const id = crypto.randomUUID();
  const now = new Date();
  const expireAt = new Date(now);
  expireAt.setDate(expireAt.getDate() + 180);

  const storedPlan: StoredPlan = {
    id,
    editKeyHash,
    brief,
    summary: aiPlan.summary,
    ideas: aiPlan.ideas,
    budget: lines,
    contingency,
    tasks: scheduled,
    vendorSuggestions: aiPlan.vendors,
    vendorPlaces: {},
    tips: aiPlan.tips,
    createdAt: now.toISOString(),
    expireAt: expireAt.toISOString(),
    templateFallback,
  };

  if (!validateBudgetSum(brief.budgetInr, lines, contingency)) {
    throw new Error("Budget invariant violated: lines + contingency !== total");
  }

  await store.create(storedPlan);
  return { plan: storedPlan, editKey };
}

/** Edits a plan's budget or task completion. */
export async function editPlan(
  store: PlanStore,
  planId: string,
  editKeyHash: string,
  edits: { budget?: BudgetLine[]; tasks?: Array<{ id: string; done: boolean }> }
): Promise<StoredPlan | null> {
  return store.mutate(planId, (plan) => {
    if (plan.editKeyHash !== editKeyHash) {
      throw new EditKeyMismatchError();
    }

    if (edits.budget) {
      const newContingency = computeContingency(plan.brief.budgetInr);
      if (!validateBudgetSum(plan.brief.budgetInr, edits.budget, newContingency)) {
        throw new BudgetValidationError();
      }
      // Validate same categories
      const existingCats = new Set(plan.budget.map((l) => l.category));
      const newCats = new Set(edits.budget.map((l) => l.category));
      if (existingCats.size !== newCats.size || ![...existingCats].every((c) => newCats.has(c))) {
        throw new BudgetValidationError();
      }
      plan.budget = edits.budget;
      plan.contingency = newContingency;
    }

    if (edits.tasks) {
      const taskMap = new Map(edits.tasks.map((t) => [t.id, t.done]));
      plan.tasks = plan.tasks.map((t) => ({
        ...t,
        done: taskMap.has(t.id) ? (taskMap.get(t.id) ?? t.done) : t.done,
      }));
    }

    return plan;
  });
}

/** Error thrown when edit key doesn't match. */
export class EditKeyMismatchError extends Error {
  constructor() {
    super("Invalid edit key");
    this.name = "EditKeyMismatchError";
  }
}

/** Error thrown when budget edit is invalid. */
export class BudgetValidationError extends Error {
  constructor() {
    super("Invalid budget edit");
    this.name = "BudgetValidationError";
  }
}
