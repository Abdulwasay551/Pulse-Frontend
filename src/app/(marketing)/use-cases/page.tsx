import type { Metadata } from "next";
import UseCasesView from "@/components/views/UseCasesView";
import { getPage, getSiteSettings, type UseCasesPageData } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Use Cases — Pulse",
  description: "How staffing agencies, executive search, RPO, and in-house teams run on Pulse.",
};

export const dynamic = "force-dynamic";

export default async function UseCasesPage() {
  const [data, settings] = await Promise.all([
    getPage<UseCasesPageData>("UseCasesPage"),
    getSiteSettings(),
  ]);

  return <UseCasesView data={data} settings={settings} />;
}
