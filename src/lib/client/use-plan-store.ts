"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import type { StoredPlan, BudgetLine } from "@/lib/contracts/plan";
import { AUTOSAVE_DELAY_MS } from "@/lib/contracts/constants";

/** Client plan state. */
export interface PlanState {
  plan: StoredPlan | null;
  editKey: string | null;
  saving: "idle" | "saving" | "saved" | "error";
  dirty: boolean;
}

type PlanAction =
  | { type: "SET_PLAN"; plan: StoredPlan; editKey: string | null }
  | { type: "UPDATE_BUDGET"; budget: BudgetLine[] }
  | { type: "TOGGLE_TASK"; taskId: string }
  | { type: "SAVE_START" }
  | { type: "SAVE_OK" }
  | { type: "SAVE_ERROR" };

/** Reducer for plan state management. */
export function planReducer(state: PlanState, action: PlanAction): PlanState {
  switch (action.type) {
    case "SET_PLAN":
      return { plan: action.plan, editKey: action.editKey, saving: "idle", dirty: false };
    case "UPDATE_BUDGET":
      if (!state.plan) return state;
      return { ...state, plan: { ...state.plan, budget: action.budget }, dirty: true };
    case "TOGGLE_TASK":
      if (!state.plan) return state;
      return {
        ...state,
        plan: {
          ...state.plan,
          tasks: state.plan.tasks.map((t) =>
            t.id === action.taskId ? { ...t, done: !t.done } : t
          ),
        },
        dirty: true,
      };
    case "SAVE_START":
      return { ...state, saving: "saving" };
    case "SAVE_OK":
      return { ...state, saving: "saved", dirty: false };
    case "SAVE_ERROR":
      return { ...state, saving: "error" };
  }
}

/** Hook for managing plan state with autosave. */
export function usePlanStore() {
  const [state, dispatch] = useReducer(planReducer, {
    plan: null,
    editKey: null,
    saving: "idle",
    dirty: false,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(async () => {
    if (!state.plan || !state.editKey || !state.dirty) return;

    dispatch({ type: "SAVE_START" });
    try {
      const response = await fetch(`/api/plan/${state.plan.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Edit-Key": state.editKey,
        },
        body: JSON.stringify({
          budget: state.plan.budget,
          tasks: state.plan.tasks.map((t) => ({ id: t.id, done: t.done })),
        }),
      });

      if (response.ok) {
        dispatch({ type: "SAVE_OK" });
      } else {
        dispatch({ type: "SAVE_ERROR" });
      }
    } catch {
      dispatch({ type: "SAVE_ERROR" });
    }
  }, [state.plan, state.editKey, state.dirty]);

  useEffect(() => {
    if (!state.dirty) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void save();
    }, AUTOSAVE_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.dirty, save]);

  return { state, dispatch };
}
