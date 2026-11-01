"use client";

import { useCallback, useSyncExternalStore, useEffect } from "react";

function getSnapshot(): boolean {
  try {
    return localStorage.getItem("utsavai-pause-animations") === "true";
  } catch {
    return false;
  }
}

const serverSnapshot = () => false;

let listeners: Array<() => void> = [];

function subscribe(cb: () => void): () => void {
  listeners = [...listeners, cb];
  function onStorage(e: StorageEvent) {
    if (e.key === "utsavai-pause-animations") cb();
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
    window.removeEventListener("storage", onStorage);
  };
}

function emitChange() {
  for (const l of listeners) l();
}

/** Toggle button that pauses all animations (WCAG 2.2.2). Persisted in localStorage. */
export function PauseAnimations() {
  const paused = useSyncExternalStore(subscribe, getSnapshot, serverSnapshot);

  useEffect(() => {
    document.documentElement.classList.toggle("paused-animations", paused);
  }, [paused]);

  const toggle = useCallback(() => {
    const next = !getSnapshot();
    try {
      localStorage.setItem("utsavai-pause-animations", String(next));
    } catch {
      // localStorage unavailable
    }
    document.documentElement.classList.toggle("paused-animations", next);
    emitChange();
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
