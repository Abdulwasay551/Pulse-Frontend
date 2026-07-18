import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import PricingTiers from "@/components/site/PricingTiers";
import ComparisonTable from "@/components/site/ComparisonTable";
import FaqAccordion from "@/components/site/FaqAccordion";
import CtaBanner from "@/components/site/CtaBanner";
import { getPage, getSiteSettings, sv, type PricingPageData } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Pricing — EvoHR",
  description: "Simple, per-recruiter pricing for EvoHR's recruitment CRM and ATS.",
};

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const [data, settings] = await Promise.all([
    getPage<PricingPageData>("PricingPage"),
    getSiteSettings(),
  ]);

  return (
    <>
      <PageHeader eyebrow={data.eyebrow} title={data.heading} subtitle={data.subtitle} />

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <PricingTiers tiers={sv(data.tiers)} />
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <div className="mb-3 font-mono text-xs uppercase tracking-wide text-primary">
              Compare plans
            </div>
            <h2 className="font-display text-3xl font-bold text-ink">
              Every feature, side by side.
            </h2>
          </div>
          <ComparisonTable rows={sv(data.comparison_rows)} />
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-10 text-center">
            <div className="mb-3 font-mono text-xs uppercase tracking-wide text-primary">FAQ</div>
            <h2 className="font-display text-3xl font-bold text-ink">
              Questions agency owners ask us
            </h2>
          </div>
          <FaqAccordion items={sv(data.faq_items)} />
        </div>
      </section>

      <CtaBanner title={settings.cta_default_title} subtitle={settings.cta_default_subtitle} />
    </>
  );
}
