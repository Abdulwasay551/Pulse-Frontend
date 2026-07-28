"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules, featureHref } from "@/lib/dashboard-modules";
import { employeesApi, listEmployeeDocuments } from "@/lib/people-api";

const moduleDef = dashboardModules.find((m) => m.key === "people")!;
const section = moduleDef.sections.find((s) => s.label === "Employee Records")!;

export default function EmployeeRecordsHubPage() {
  const { withAuth } = useAuth();
  const [stats, setStats] = useState<{ employees: number; departments: number; documents: number } | null>(null);

  useEffect(() => {
    withAuth((token) => Promise.all([employeesApi.list(token), listEmployeeDocuments(token)])).then(
      ([employees, documents]) => {
        setStats({
          employees: employees.length,
          departments: new Set(employees.map((e) => e.department).filter(Boolean)).size,
          documents: documents.length,
        });
      }
    );
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
          <StatCard label="Employees" value={String(stats.employees)} href="/dashboard/employee-database?view=employees" />
          <StatCard label="Departments" value={String(stats.departments)} href="/dashboard/org-chart" />
          <StatCard label="Documents on file" value={String(stats.documents)} href="/dashboard/employee-database?view=documents" />
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
