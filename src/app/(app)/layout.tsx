import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { AuthProvider } from "@/lib/auth-context";
import "../globals.css";

export const metadata: Metadata = {
  title: "Pulse Dashboard (Demo)",
  description: "A sample walkthrough of the Pulse product — demo data only.",
  robots: "noindex, nofollow",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
