"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules, featureHref } from "@/lib/dashboard-modules";
import { filterSectionsForRole } from "@/lib/role-access";
import { assetsApi } from "@/lib/it-assets-api";

const moduleDef = dashboardModules.find((m) => m.key === "it-assets")!;
const section = moduleDef.sections.find((s) => s.label === "Assets Management")!;

export default function AssetsManagementHubPage() {
  const { withAuth, user } = useAuth();
  const [stats, setStats] = useState<{ total: number; assigned: number; expiringSoon: number; inRepair: number } | null>(null);

  useEffect(() => {
    withAuth((token) => assetsApi.list(token)).then((assets) => {
      setStats({
        total: assets.length,
        assigned: assets.filter((a) => a.status === "Assigned").length,
        expiringSoon: assets.filter((a) => a.warranty_status === "Expiring Soon").length,
        inRepair: assets.filter((a) => a.status === "In Repair").length,
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
          <StatCard label="Total assets" value={String(stats.total)} href="/dashboard/asset-inventory" />
          <StatCard label="Assigned devices" value={String(stats.assigned)} href="/dashboard/asset-inventory" />
          <StatCard label="Warranty expiring soon" value={String(stats.expiringSoon)} href="/dashboard/warranty-tracking" />
          <StatCard label="In repair" value={String(stats.inRepair)} href="/dashboard/device-tracker" />
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
