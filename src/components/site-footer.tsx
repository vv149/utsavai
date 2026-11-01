"use client";

import { useEffect, useState } from "react";
import { APP_NAME } from "@/lib/contracts/constants";

/** Site footer. */
export function SiteFooter() {
  const [year, setYear] = useState(2026);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only Date read
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
