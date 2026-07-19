import type { Metadata } from "next";
import WhoWeServeView from "@/components/views/WhoWeServeView";
import { getPage, getSiteSettings, type WhoWeServePageData } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Who We Serve — EvoHR",
  description: "EvoHR gives every seat on the recruiting team its own view of the same record.",
};

export const dynamic = "force-dynamic";

export default async function WhoWeServePage() {
  const [data, settings] = await Promise.all([
    getPage<WhoWeServePageData>("WhoWeServePage"),
    getSiteSettings(),
  ]);

  return <WhoWeServeView data={data} settings={settings} />;
}
