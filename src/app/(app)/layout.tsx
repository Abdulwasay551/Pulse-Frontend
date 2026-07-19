import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "EvoHR Dashboard (Demo)",
  description: "A sample walkthrough of the EvoHR product — demo data only.",
  robots: "noindex, nofollow",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full font-mono">{children}</body>
    </html>
  );
}
