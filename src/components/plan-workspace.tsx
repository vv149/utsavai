"use client";

import { useState, useEffect } from "react";
import type { StoredPlan } from "@/lib/contracts/plan";
import { PLAN_TABS } from "@/lib/contracts/constants";
import type { PlanTab } from "@/lib/contracts/constants";
import { usePlanStore } from "@/lib/client/use-plan-store";
import { OverviewTab } from "@/components/tabs/overview-tab";
import { IdeasTab } from "@/components/tabs/ideas-tab";
import { BudgetTab } from "@/components/tabs/budget-tab";
import { TimelineTab } from "@/components/tabs/timeline-tab";
import { VendorsTab } from "@/components/tabs/vendors-tab";
import { AskTab } from "@/components/tabs/ask-tab";
import { ShareTab } from "@/components/tabs/share-tab";
import { SaveIndicator } from "@/components/save-indicator";

/** Tabbed plan workspace. */
export function PlanWorkspace({ plan }: { plan: Omit<StoredPlan, "editKeyHash"> }) {
  const [activeTab, setActiveTab] = useState<PlanTab>("overview");
  const { state, dispatch } = usePlanStore();

  useEffect(() => {
    const hash = window.location.hash;
    const keyMatch = hash.match(/key=([^&]+)/);
    const editKey = keyMatch ? keyMatch[1] : null;
    dispatch({ type: "SET_PLAN", plan: plan as StoredPlan, editKey });
  }, [plan, dispatch]);

  const isReadOnly = !state.editKey;
  const currentPlan = state.plan ?? (plan as StoredPlan);

  const TAB_LABELS: Record<PlanTab, string> = {
    overview: "Overview",
    ideas: "Ideas",
    budget: "Budget",
    timeline: "Timeline",
    vendors: "Vendors",
    ask: "Ask",
    share: "Share",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-gold)" }}>
          {currentPlan.brief.eventType} Plan
        </h1>
        <div className="flex items-center gap-3">
          {isReadOnly && (
            <span className="text-sm px-2 py-1 rounded" style={{ backgroundColor: "var(--color-bg-input)", color: "var(--color-text-muted)" }}>
              Read-only
            </span>
          )}
          <SaveIndicator saving={state.saving} />
        </div>
      </div>

      <div role="tablist" aria-label="Plan sections" className="flex gap-1 mb-6 overflow-x-auto">
        {PLAN_TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            id={`tab-${tab}`}
            aria-selected={activeTab === tab}
            aria-controls={`panel-${tab}`}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap min-h-[44px] min-w-[44px] transition-colors"
            style={{
              backgroundColor: activeTab === tab ? "var(--color-accent)" : "var(--color-bg-card)",
              color: activeTab === tab ? "white" : "var(--color-text-muted)",
            }}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        tabIndex={0}
      >
        {activeTab === "overview" && <OverviewTab plan={currentPlan} />}
        {activeTab === "ideas" && <IdeasTab ideas={currentPlan.ideas} />}
        {activeTab === "budget" && (
          <BudgetTab
            budget={currentPlan.budget}
            contingency={currentPlan.contingency}
            totalInr={currentPlan.brief.budgetInr}
            readOnly={isReadOnly}
            onBudgetChange={(budget) => dispatch({ type: "UPDATE_BUDGET", budget })}
          />
        )}
        {activeTab === "timeline" && (
          <TimelineTab
            tasks={currentPlan.tasks}
            eventDate={currentPlan.brief.date}
            readOnly={isReadOnly}
            onToggleTask={(id) => dispatch({ type: "TOGGLE_TASK", taskId: id })}
          />
        )}
        {activeTab === "vendors" && (
          <VendorsTab
            suggestions={currentPlan.vendorSuggestions}
            places={currentPlan.vendorPlaces}
            planId={currentPlan.id}
          />
        )}
        {activeTab === "ask" && <AskTab planId={currentPlan.id} />}
        {activeTab === "share" && <ShareTab planId={currentPlan.id} />}
      </div>
    </div>
  );
}
