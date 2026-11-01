"use client";

import { useState, useEffect } from "react";
import { APP_NAME } from "@/lib/contracts/constants";

/** Site footer. */
export function SiteFooter() {
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);

  return (
    <footer
      className="text-center py-6 text-sm"
      style={{ color: "var(--color-text-muted)", borderTop: "1px solid var(--color-border)" }}
    >
      <p>
        &copy; {year} {APP_NAME}. AI ideates, code calculates.
      </p>
    </footer>
  );
}
