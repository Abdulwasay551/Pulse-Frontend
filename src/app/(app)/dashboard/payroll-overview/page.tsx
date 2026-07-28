"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules, featureHref } from "@/lib/dashboard-modules";
import { payrollApi, taxProfilesApi, complianceEventsApi } from "@/lib/payroll-benefits-api";

const moduleDef = dashboardModules.find((m) => m.key === "payroll-benefits")!;
const section = moduleDef.sections.find((s) => s.label === "Payroll")!;

export default function PayrollOverviewHubPage() {
  const { withAuth } = useAuth();
  const [stats, setStats] = useState<{ runs: number; needsReview: number; actionRequired: number; overdue: number } | null>(null);

  useEffect(() => {
    withAuth((token) =>
      Promise.all([payrollApi.list(token), taxProfilesApi.list(token), complianceEventsApi.list(token)])
    ).then(([runs, taxProfiles, events]) => {
      const today = new Date();
      setStats({
        runs: runs.length,
        needsReview: runs.filter((r) => r.status === "Needs review").length,
        actionRequired: taxProfiles.filter((t) => t.compliance_status === "Action Required").length,
        overdue: events.filter((e) => !e.completed && new Date(e.due_date) < today).length,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <StatCard label="Payroll runs" value={String(stats.runs)} href="/dashboard/payroll" />
          <StatCard label="Runs needing review" value={String(stats.needsReview)} href="/dashboard/payroll-audit" />
          <StatCard label="Tax action required" value={String(stats.actionRequired)} href="/dashboard/tax-compliance" />
          <StatCard label="Compliance events overdue" value={String(stats.overdue)} href="/dashboard/compliance-calendar" />
        </div>
      )}

      <h2 className="mb-4 font-display text-lg font-bold text-ink">Features</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {section.features.map((feature) => (
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
