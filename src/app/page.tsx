import { APP_NAME, APP_TAGLINE } from "@/lib/contracts/constants";
import { PlannerForm } from "@/components/planner-form";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 flex flex-col items-center px-4 py-12">
        <section aria-label="Hero" className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold mb-4" style={{ color: "var(--color-gold)" }}>
            {APP_NAME}
          </h1>
          <p className="text-xl mb-2" style={{ color: "var(--color-text)" }}>
            {APP_TAGLINE}
          </p>
          <p style={{ color: "var(--color-text-muted)" }}>
            Plan your Indian wedding, birthday, puja, or community celebration
            with AI-powered budgets, timelines, and vendor guidance.
          </p>
        </section>
        <section aria-label="Create your plan" className="w-full max-w-lg">
          <PlannerForm />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
