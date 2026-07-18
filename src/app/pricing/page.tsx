import type { Metadata } from "next";
import PricingView from "@/components/views/PricingView";
import { getPage, getSiteSettings, type PricingPageData } from "@/lib/cms";

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

  return <PricingView data={data} settings={settings} />;
}
