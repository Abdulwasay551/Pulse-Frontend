import type { Metadata } from "next";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { getSiteSettings } from "@/lib/cms";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "EvoHR — The recruitment CRM & ATS for agency recruiters",
  description:
    "EvoHR is the all-in-one CRM and applicant tracking system for staffing agencies and recruiters — candidates, clients, and placements in one place.",
};

// All content comes from the headless CMS, which isn't reachable at build
// time (e.g. on Vercel). Render every route at request time instead of
// prerendering, so the build never depends on the backend being up.
export const dynamic = "force-dynamic";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-mono">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
