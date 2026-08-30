"use client";

import { Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Breadcrumbs from "./Breadcrumbs";
import ImpersonationBanner from "./ImpersonationBanner";
import { findActiveModuleForRoute } from "@/lib/dashboard-modules";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DashboardShellInner>{children}</DashboardShellInner>
    </Suspense>
  );
}

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The "coming soon" placeholder isn't itself a feature of any module, so
  // it needs the same ?module= fallback lookup the sidebar uses — otherwise
  // the sidebar (and the mobile menu button) would disappear on that route.
  const hasSidebar = findActiveModuleForRoute(pathname, searchParams) !== null;
  // Settings pages render their own edge-pinned sidebar (SettingsShell)
  // rather than the module Sidebar above — <main> needs to give up its
  // padding for that column to actually reach the left edge, the same way
  // it reaches the left edge when the module Sidebar is absent.
  const hasOwnFullBleedLayout = pathname.startsWith("/dashboard/settings");

  return (
    <div className="flex h-screen overflow-hidden bg-cream-dim">
      {hasSidebar && <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col">
        <ImpersonationBanner />
        <Topbar onOpenSidebar={() => setMobileOpen(true)} showMenuButton={hasSidebar} />
        <Breadcrumbs />
        <main className={hasOwnFullBleedLayout ? "flex-1 overflow-hidden" : "flex-1 overflow-y-auto p-4 sm:p-6"}>
          {children}
        </main>
      </div>
    </div>
  );
}
