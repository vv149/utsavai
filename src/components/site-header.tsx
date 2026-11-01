import { APP_NAME } from "@/lib/contracts/constants";

/** Site header with app name. */
export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-40 flex items-center px-4"
      style={{
        height: "var(--header-height)",
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <nav aria-label="Main">
        <a href="/" className="text-lg font-bold" style={{ color: "var(--color-gold)" }}>
          {APP_NAME}
        </a>
      </nav>
    </header>
  );
}
