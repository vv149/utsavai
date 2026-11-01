"use client";

/** Visual indicator for autosave state. */
export function SaveIndicator({ saving }: { saving: "idle" | "saving" | "saved" | "error" }) {
  if (saving === "idle") return null;

  const labels: Record<string, string> = {
    saving: "Saving...",
    saved: "Saved",
    error: "Save failed",
  };

  const colors: Record<string, string> = {
    saving: "var(--color-text-muted)",
    saved: "var(--color-success)",
    error: "var(--color-error)",
  };

  return (
    <span
      aria-live="polite"
      className="text-sm"
      style={{ color: colors[saving] }}
    >
      {labels[saving]}
    </span>
  );
}
