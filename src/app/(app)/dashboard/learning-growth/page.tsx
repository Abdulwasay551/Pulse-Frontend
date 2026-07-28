"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules, featureHref } from "@/lib/dashboard-modules";
import { coursesApi, enrollmentsApi, careerPathsApi, successionPlansApi } from "@/lib/talent-api";

const moduleDef = dashboardModules.find((m) => m.key === "talent")!;
const section = moduleDef.sections.find((s) => s.label === "Learning & Growth")!;

export default function LearningGrowthHubPage() {
  const { withAuth } = useAuth();
  const [stats, setStats] = useState<{ courses: number; enrollments: number; careerPaths: number; succession: number } | null>(null);

  useEffect(() => {
    withAuth((token) =>
      Promise.all([coursesApi.list(token), enrollmentsApi.list(token), careerPathsApi.list(token), successionPlansApi.list(token)])
    ).then(([courses, enrollments, careerPaths, succession]) => {
      setStats({
        courses: courses.filter((c) => c.is_active).length,
        enrollments: enrollments.length,
        careerPaths: careerPaths.length,
        succession: succession.length,
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
          <StatCard label="Active courses" value={String(stats.courses)} href="/dashboard/learning" />
          <StatCard label="Enrollments" value={String(stats.enrollments)} href="/dashboard/learning" />
          <StatCard label="Career paths mapped" value={String(stats.careerPaths)} href="/dashboard/career-paths" />
          <StatCard label="Succession plans" value={String(stats.succession)} href="/dashboard/succession-planning" />
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
