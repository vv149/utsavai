"use client";

import { useEffect, useState, useCallback } from "react";

/** Toggle button that pauses all animations (WCAG 2.2.2). Persisted in localStorage. */
export function PauseAnimations() {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("utsavai-pause-animations");
      if (stored === "true") {
        setPaused(true);
        document.documentElement.classList.add("paused-animations");
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggle = useCallback(() => {
    setPaused((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("paused-animations", next);
      try {
        localStorage.setItem("utsavai-pause-animations", String(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  }, []);

  // ponytail: sync across tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "utsavai-pause-animations") {
        const val = e.newValue === "true";
        setPaused(val);
        document.documentElement.classList.toggle("paused-animations", val);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <button
      onClick={toggle}
      aria-pressed={paused}
      className="fixed bottom-4 right-4 z-50 min-w-[44px] min-h-[44px] rounded-full px-3 py-2 text-sm font-medium"
      style={{
        backgroundColor: paused ? "var(--color-gold)" : "var(--color-bg-card)",
        color: paused ? "var(--color-bg)" : "var(--color-text)",
        border: `1px solid var(--color-border)`,
      }}
    >
      {paused ? "▶ Play" : "⏸ Pause"} animations
    </button>
  );
}
