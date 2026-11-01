"use client";

import { useState, useCallback } from "react";
import type { VendorSuggestion, VendorPlace } from "@/lib/contracts/plan";

/** Vendors tab with category-based vendor discovery. */
export function VendorsTab({
  suggestions,
  places,
  planId,
}: {
  suggestions: readonly VendorSuggestion[];
  places: Record<string, VendorPlace[]>;
  planId: string;
}) {
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);
  const [localPlaces, setLocalPlaces] = useState(places);

  const lookupVendors = useCallback(
    async (category: string) => {
      setLoadingCategory(category);
      try {
        const response = await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId, category }),
        });
        if (response.ok) {
          const data = await response.json();
          setLocalPlaces((prev) => ({ ...prev, [category]: data.places }));
        }
      } finally {
        setLoadingCategory(null);
      }
    },
    [planId]
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold" style={{ color: "var(--color-gold)" }}>
        Vendor Guidance
      </h2>

      {suggestions.map((vendor) => (
        <section
          key={vendor.category}
          className="rounded-lg p-5"
          style={{ backgroundColor: "var(--color-bg-card)", border: "1px solid var(--color-border)" }}
          aria-label={`${vendor.category} vendors`}
        >
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-accent)" }}>
            {vendor.category}
          </h3>

          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1" style={{ color: "var(--color-gold)" }}>Tips</h4>
            <ul className="list-disc pl-4 text-sm">
              {vendor.tips.map((tip, i) => (
                <li key={i} style={{ color: "var(--color-text)" }}>{tip}</li>
              ))}
            </ul>
          </div>

          {localPlaces[vendor.category]?.length ? (
            <div>
              <h4 className="text-sm font-medium mb-2" style={{ color: "var(--color-gold)" }}>
                Nearby Places
              </h4>
              <ul className="space-y-2">
                {localPlaces[vendor.category].map((place, i) => (
                  <li key={i} className="text-sm">
                    <a
                      href={place.mapsUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "var(--color-accent)" }}
                    >
                      {place.name}
                    </a>
                    {place.address && (
                      <span style={{ color: "var(--color-text-muted)" }}> — {place.address}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <button
              onClick={() => lookupVendors(vendor.category)}
              disabled={loadingCategory === vendor.category}
              className="mt-2 rounded-lg px-4 py-2 text-sm font-medium min-h-[44px] transition-colors"
              style={{
                backgroundColor: "var(--color-accent)",
                color: "white",
              }}
            >
              {loadingCategory === vendor.category ? "Searching..." : `Find ${vendor.category} vendors`}
            </button>
          )}
        </section>
      ))}
    </div>
  );
}
