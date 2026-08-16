"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules, featureHref } from "@/lib/dashboard-modules";
import { filterSectionsForRole } from "@/lib/role-access";
import { supportTicketsApi, assetRecoveriesApi, byodComplianceApi } from "@/lib/it-assets-api";

const moduleDef = dashboardModules.find((m) => m.key === "it-assets")!;
const section = moduleDef.sections.find((s) => s.label === "IT Management")!;

export default function ItManagementHubPage() {
  const { withAuth, user } = useAuth();
  const [stats, setStats] = useState<{ openTickets: number; inProgress: number; pendingRecoveries: number; nonCompliant: number } | null>(
    null
  );

  useEffect(() => {
    // allSettled — a narrower role may not have access to every one of
    // these three resources, so one 403 shouldn't blank every stat.
    withAuth((token) =>
      Promise.allSettled([supportTicketsApi.list(token), assetRecoveriesApi.list(token), byodComplianceApi.list(token)])
    ).then(([ticketsResult, recoveriesResult, byodResult]) => {
      const tickets = ticketsResult.status === "fulfilled" ? ticketsResult.value : [];
      const recoveries = recoveriesResult.status === "fulfilled" ? recoveriesResult.value : [];
      const byod = byodResult.status === "fulfilled" ? byodResult.value : [];
      setStats({
        openTickets: tickets.filter((t) => t.status === "Open").length,
        inProgress: tickets.filter((t) => t.status === "In Progress").length,
        pendingRecoveries: recoveries.filter((r) => r.status === "Pending").length,
        nonCompliant: byod.filter((b) => b.compliance_status === "Non-Compliant").length,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleFeatures = filterSectionsForRole([section], user?.role)[0]?.features ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <ModuleHeader
        icon={section.icon}
        title={section.label}
        description={section.description}
        backHref={moduleDef.overviewHref}
        backLabel={moduleDef.label}
      />

      {!stats ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Open tickets" value={String(stats.openTickets)} href="/dashboard/it-support" />
          <StatCard label="In progress" value={String(stats.inProgress)} href="/dashboard/it-support" />
          <StatCard label="Pending recoveries" value={String(stats.pendingRecoveries)} href="/dashboard/asset-recovery" />
          <StatCard label="BYOD non-compliant" value={String(stats.nonCompliant)} href="/dashboard/byod-policy" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleFeatures.map((feature) => (
          <FeatureTile
            key={feature.label}
            icon={feature.icon}
            title={feature.label}
            description={feature.description}
            href={featureHref(moduleDef, section, feature)}
            comingSoon={!feature.href}
          />
        ))}
      </div>
    </div>
  );
}
