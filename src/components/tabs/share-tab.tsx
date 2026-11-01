"use client";

import { useState, useCallback } from "react";

/** Share tab with copy link and native share. */
export function ShareTab({ planId }: { planId: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/plan/${planId}`
    : `/plan/${planId}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "UtsavAI Plan",
          text: "Check out my celebration plan!",
          url: shareUrl,
        });
      } catch {
        // user cancelled
      }
    }
  }, [shareUrl]);

  const icsUrl = `/api/plan/${planId}/ics`;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" style={{ color: "var(--color-gold)" }}>
        Share Your Plan
      </h2>
      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
        Share a read-only link with friends and family. They can view but not edit the plan.
      </p>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            aria-label="Share URL"
            className="flex-1 rounded-lg px-3 py-3 text-sm min-h-[44px]"
            style={{
              backgroundColor: "var(--color-bg-input)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          />
          <button
            onClick={handleCopy}
            className="rounded-lg px-4 py-2 text-sm font-medium min-h-[44px]"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          >
            <span aria-live="polite">{copied ? "Copied!" : "Copy"}</span>
          </button>
        </div>

        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={handleNativeShare}
            className="rounded-lg px-4 py-2 text-sm font-medium min-h-[44px]"
            style={{
              backgroundColor: "var(--color-bg-card)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            Share via...
          </button>
        )}

        <div>
          <a
            href={icsUrl}
            download
            className="inline-block rounded-lg px-4 py-2 text-sm font-medium min-h-[44px] leading-[44px]"
            style={{
              backgroundColor: "var(--color-bg-card)",
              color: "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            📅 Download Calendar (.ics)
          </a>
        </div>
      </div>
    </div>
  );
}
