"use client";

/** Skip-to-content link for keyboard navigation. */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:rounded focus:text-[var(--color-text)]"
      style={{ backgroundColor: "var(--color-accent)" }}
    >
      Skip to main content
    </a>
  );
}
