"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules, featureHref } from "@/lib/dashboard-modules";
import { filterSectionsForRole } from "@/lib/role-access";
import { benefitPlansApi, benefitEnrollmentsApi, benefitClaimsApi } from "@/lib/payroll-benefits-api";

const moduleDef = dashboardModules.find((m) => m.key === "payroll-benefits")!;
const section = moduleDef.sections.find((s) => s.label === "Benefits")!;

export default function BenefitsOverviewHubPage() {
  const { withAuth, user } = useAuth();
  const [stats, setStats] = useState<{ plans: number; activeEnrollments: number; pendingClaims: number } | null>(null);

  useEffect(() => {
    // allSettled — Department Head has no BenefitPlan access here (only
    // enrollments/claims, read-only), so one 403 shouldn't blank every stat.
    withAuth((token) =>
      Promise.allSettled([benefitPlansApi.list(token), benefitEnrollmentsApi.list(token), benefitClaimsApi.list(token)])
    ).then(([plansResult, enrollmentsResult, claimsResult]) => {
      const plans = plansResult.status === "fulfilled" ? plansResult.value : [];
      const enrollments = enrollmentsResult.status === "fulfilled" ? enrollmentsResult.value : [];
      const claims = claimsResult.status === "fulfilled" ? claimsResult.value : [];
      setStats({
        plans: plans.length,
        activeEnrollments: enrollments.filter((e) => e.status === "Enrolled").length,
        pendingClaims: claims.filter((c) => c.status === "Submitted" || c.status === "Under Review").length,
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
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Benefit plans" value={String(stats.plans)} href="/dashboard/benefits-enrollment" />
          <StatCard label="Active enrollments" value={String(stats.activeEnrollments)} href="/dashboard/benefits-enrollment" />
          <StatCard label="Pending claims" value={String(stats.pendingClaims)} href="/dashboard/claims" />
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
