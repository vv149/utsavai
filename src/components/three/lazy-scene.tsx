"use client";

import { lazy, Suspense, useMemo } from "react";

const ConfettiScene = lazy(() => import("./confetti-scene"));
const BudgetFlowScene = lazy(() => import("./budget-flow-scene"));
const LanternScene = lazy(() => import("./lantern-scene"));

type SceneType = "confetti" | "budget-flow" | "lanterns";

/** Lazy-loads a Three.js scene with Suspense and tier gating. */
export function LazyScene({ scene, paused }: { scene: SceneType; paused: boolean }) {
  const tier = useMemo<"high" | "low" | "none">(() => {
    if (paused) return "none";
    if (typeof navigator === "undefined") return "none";
    const cores = navigator.hardwareConcurrency ?? 2;
    return cores >= 4 ? "high" : "low";
  }, [paused]);

  if (tier === "none") return null;

  return (
    <Suspense fallback={<div className="h-48 animate-pulse rounded-lg" style={{ backgroundColor: "var(--color-bg-card)" }} />}>
      {scene === "confetti" && <ConfettiScene tier={tier} />}
      {scene === "budget-flow" && <BudgetFlowScene tier={tier} />}
      {scene === "lanterns" && <LanternScene tier={tier} />}
    </Suspense>
  );
}
