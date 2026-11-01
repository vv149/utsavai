import { z } from "zod/v4";

/** Zod schema for a single event idea. */
export const IdeaSchema = z.object({
  name: z.string().min(1).max(200),
  concept: z.string().min(1).max(500),
  palette: z.array(z.string().min(1).max(50)).min(1).max(8),
  decor: z.array(z.string().min(1).max(200)).min(1).max(10),
  food: z.array(z.string().min(1).max(200)).min(1).max(10),
  music: z.array(z.string().min(1).max(200)).min(1).max(10),
  signatureMoment: z.string().min(1).max(300),
});

/** Zod schema for a single budget category weight. */
export const BudgetWeightSchema = z.object({
  category: z.string().min(1).max(100),
  weight: z.number().min(0).max(1),
});

/** Zod schema for a task dependency reference. */
export const TaskSchema = z.object({
  id: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  leadDays: z.int().min(0).max(365),
  depends: z.array(z.string().min(1).max(50)).max(20).default([]),
});

/** Zod schema for a vendor suggestion. */
export const VendorSuggestionSchema = z.object({
  category: z.string().min(1).max(100),
  query: z.string().min(1).max(300),
  tips: z.array(z.string().min(1).max(500)).min(1).max(5),
});

/** Zod schema for a grounded vendor place. */
export const VendorPlaceSchema = z.object({
  name: z.string().min(1).max(300),
  address: z.string().max(500).default(""),
  mapsUri: z.url().startsWith("https://"),
  rating: z.number().min(0).max(5).optional(),
});

/** Zod schema for an AI-generated plan payload. */
export const AiPlanSchema = z
  .object({
    summary: z.string().min(10).max(2000),
    ideas: z.array(IdeaSchema).min(1).max(5),
    budgetWeights: z
      .array(BudgetWeightSchema)
      .min(2)
      .max(15)
      .refine(
        (weights) => {
          const cats = weights.map((w) => w.category);
          return new Set(cats).size === cats.length;
        },
        { message: "Budget categories must be unique" }
      ),
    tasks: z
      .array(TaskSchema)
      .min(1)
      .max(50)
      .refine(
        (tasks) => {
          const ids = tasks.map((t) => t.id);
          return new Set(ids).size === ids.length;
        },
        { message: "Task IDs must be unique" }
      ),
    vendors: z
      .array(VendorSuggestionSchema)
      .min(1)
      .max(10)
      .refine(
        (vendors) => {
          const cats = vendors.map((v) => v.category);
          return new Set(cats).size === cats.length;
        },
        { message: "Vendor categories must be unique" }
      ),
    tips: z.array(z.string().min(1).max(500)).min(1).max(10),
  })
  .strict();

/** Zod schema for the plan creation brief. */
export const BriefSchema = z
  .object({
    eventType: z.string().min(1).max(100),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    city: z.string().min(1).max(100),
    guests: z.int().min(1).max(100_000),
    budgetInr: z.int().min(1000).max(100_000_000),
    brief: z.string().max(2000).default(""),
    language: z.string().max(10).default("en"),
  })
  .strict();

/** Zod schema for a budget line item. */
export const BudgetLineSchema = z.object({
  category: z.string().min(1).max(100),
  amount: z.int().min(0),
  locked: z.boolean().default(false),
});

/** Zod schema for a scheduled task with computed dates. */
export const ScheduledTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  startDate: z.string(),
  dueDate: z.string(),
  done: z.boolean().default(false),
});

/** Zod schema for a stored plan. */
export const StoredPlanSchema = z.object({
  id: z.string().min(1),
  editKeyHash: z.string().min(1),
  brief: BriefSchema,
  summary: z.string(),
  ideas: z.array(IdeaSchema),
  budget: z.array(BudgetLineSchema),
  contingency: z.int().min(0),
  tasks: z.array(ScheduledTaskSchema),
  vendorSuggestions: z.array(VendorSuggestionSchema),
  vendorPlaces: z
    .record(z.string(), z.array(VendorPlaceSchema))
    .default({}),
  tips: z.array(z.string()),
  createdAt: z.string(),
  expireAt: z.string(),
  templateFallback: z.boolean().default(false),
});

/** Zod schema for a plan edit (PATCH). */
export const PlanEditSchema = z
  .object({
    budget: z.array(BudgetLineSchema).min(2).max(15).optional(),
    tasks: z
      .array(z.object({ id: z.string(), done: z.boolean() }))
      .min(1)
      .max(50)
      .optional(),
  })
  .strict()
  .refine((e) => e.budget ?? e.tasks, {
    message: "At least one of budget or tasks must be provided",
  });

/** Zod schema for the refine/ask request. */
export const RefineRequestSchema = z
  .object({
    planId: z.string().min(1),
    question: z.string().min(1).max(2000),
  })
  .strict();

/** Zod schema for vendor lookup request. */
export const VendorRequestSchema = z
  .object({
    planId: z.string().min(1),
    category: z.string().min(1).max(100),
  })
  .strict();

export type Idea = z.infer<typeof IdeaSchema>;
export type BudgetWeight = z.infer<typeof BudgetWeightSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type VendorSuggestion = z.infer<typeof VendorSuggestionSchema>;
export type VendorPlace = z.infer<typeof VendorPlaceSchema>;
export type AiPlan = z.infer<typeof AiPlanSchema>;
export type Brief = z.infer<typeof BriefSchema>;
export type BudgetLine = z.infer<typeof BudgetLineSchema>;
export type ScheduledTask = z.infer<typeof ScheduledTaskSchema>;
export type StoredPlan = z.infer<typeof StoredPlanSchema>;
export type PlanEdit = z.infer<typeof PlanEditSchema>;
export type RefineRequest = z.infer<typeof RefineRequestSchema>;
export type VendorRequest = z.infer<typeof VendorRequestSchema>;
