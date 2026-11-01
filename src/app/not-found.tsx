import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center px-4 py-24">
        <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--color-gold)" }}>
          404
        </h1>
        <p className="text-lg mb-6" style={{ color: "var(--color-text-muted)" }}>
          This plan doesn&apos;t exist or has expired.
        </p>
        <a
          href="/"
          className="rounded-lg px-6 py-3 font-medium min-h-[44px] inline-block"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
        >
          Create a new plan
        </a>
      </main>
      <SiteFooter />
    </>
  );
}
