import { getStore } from "@/lib/server/store-singleton";
import { PlanWorkspace } from "@/components/plan-workspace";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  await connection();
  const { id } = await params;
  const store = getStore();
  const plan = await store.load(id);

  if (!plan) {
    return { title: "Plan not found" };
  }

  return {
    title: `${plan.brief.eventType} Plan`,
    description: `${plan.summary.slice(0, 160)}`,
    robots: { index: false, follow: false },
  };
}

async function PlanContent({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const store = getStore();
  const plan = await store.load(id);

  if (!plan) {
    notFound();
  }

  const { editKeyHash: _hash, ...safePlan } = plan;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
        <PlanWorkspace plan={safePlan} />
      </main>
      <SiteFooter />
    </>
  );
}

export default function PlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20">Loading plan...</div>}>
      <PlanContent params={params} />
    </Suspense>
  );
}
