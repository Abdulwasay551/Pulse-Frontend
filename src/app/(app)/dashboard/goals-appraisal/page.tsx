"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules, featureHref } from "@/lib/dashboard-modules";
import { goalsApi, appraisalsApi, competencyRatingsApi } from "@/lib/talent-api";

const moduleDef = dashboardModules.find((m) => m.key === "talent")!;
const section = moduleDef.sections.find((s) => s.label === "Goals & Appraisal")!;

export default function GoalsAppraisalHubPage() {
  const { withAuth } = useAuth();
  const [stats, setStats] = useState<{ goalsInProgress: number; appraisals: number; competencies: number } | null>(null);

  useEffect(() => {
    withAuth((token) =>
      Promise.all([goalsApi.list(token), appraisalsApi.list(token), competencyRatingsApi.list(token)])
    ).then(([goals, appraisals, competencies]) => {
      setStats({
        goalsInProgress: goals.filter((g) => g.status === "In Progress").length,
        appraisals: appraisals.length,
        competencies: competencies.length,
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
          <StatCard label="Goals in progress" value={String(stats.goalsInProgress)} href="/dashboard/goals" />
          <StatCard label="Appraisals on file" value={String(stats.appraisals)} href="/dashboard/appraisals?view=appraisals" />
          <StatCard label="Competencies tracked" value={String(stats.competencies)} href="/dashboard/competency-mapping?view=employees" />
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
