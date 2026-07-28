"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules, featureHref } from "@/lib/dashboard-modules";
import { surveysApi, recognitionsApi, promotionRequestsApi } from "@/lib/people-api";

const moduleDef = dashboardModules.find((m) => m.key === "people")!;
const section = moduleDef.sections.find((s) => s.label === "Employee Engagement")!;

export default function EmployeeEngagementHubPage() {
  const { withAuth } = useAuth();
  const [stats, setStats] = useState<{ openSurveys: number; recognitions: number; pendingPromotions: number } | null>(null);

  useEffect(() => {
    withAuth((token) =>
      Promise.all([surveysApi.list(token), recognitionsApi.list(token), promotionRequestsApi.list(token)])
    ).then(([surveys, recognitions, promotions]) => {
      setStats({
        openSurveys: surveys.filter((s) => s.is_open).length,
        recognitions: recognitions.length,
        pendingPromotions: promotions.filter((p) => p.status === "Pending").length,
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
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Open surveys & pulse checks" value={String(stats.openSurveys)} href="/dashboard/surveys?kind=Survey" />
          <StatCard label="Recognitions given" value={String(stats.recognitions)} href="/dashboard/recognition" />
          <StatCard label="Pending promotions" value={String(stats.pendingPromotions)} href="/dashboard/promotions" />
        </div>
      )}

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
