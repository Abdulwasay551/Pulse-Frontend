import type { Metadata } from "next";
import ResourcesView from "@/components/views/ResourcesView";
import { getPage, getSiteSettings, type ResourcesPageData } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Resources — Pulse",
  description: "Guides, playbooks, and documentation for running your desk on Pulse.",
};

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const [data, settings] = await Promise.all([
    getPage<ResourcesPageData>("ResourcesPage"),
    getSiteSettings(),
  ]);

  return <ResourcesView data={data} settings={settings} />;
}
