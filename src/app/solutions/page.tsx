import type { Metadata } from "next";
import SolutionsView from "@/components/views/SolutionsView";
import { getPage, getProducts, getSiteSettings, type SolutionsPageData } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Solutions — EvoHR",
  description: "Every module in the EvoHR suite, from core CRM to global mobility.",
};

export const dynamic = "force-dynamic";

export default async function SolutionsPage() {
  const [data, products, settings] = await Promise.all([
    getPage<SolutionsPageData>("SolutionsPage"),
    getProducts(),
    getSiteSettings(),
  ]);

  return <SolutionsView data={data} products={products} settings={settings} />;
}
