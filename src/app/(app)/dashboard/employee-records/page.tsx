"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules, featureHref } from "@/lib/dashboard-modules";
import { filterSectionsForRole } from "@/lib/role-access";
import { employeesApi, listEmployeeDocuments } from "@/lib/people-api";

const moduleDef = dashboardModules.find((m) => m.key === "people")!;
const section = moduleDef.sections.find((s) => s.label === "Employee Records")!;

export default function EmployeeRecordsHubPage() {
  const { withAuth, user } = useAuth();
  const [stats, setStats] = useState<{ employees: number; departments: number; documents: number } | null>(null);

  useEffect(() => {
    // allSettled — Department Head has no EmployeeDocument access here
    // (only employees, read-only, department-scoped), so one 403 shouldn't
    // blank the employee/department counts too.
    withAuth((token) => Promise.allSettled([employeesApi.list(token), listEmployeeDocuments(token)])).then(
      ([employeesResult, documentsResult]) => {
        const employees = employeesResult.status === "fulfilled" ? employeesResult.value : [];
        const documents = documentsResult.status === "fulfilled" ? documentsResult.value : [];
        setStats({
          employees: employees.length,
          departments: new Set(employees.map((e) => e.department).filter(Boolean)).size,
          documents: documents.length,
        });
      }
    );
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
          <StatCard label="Employees" value={String(stats.employees)} href="/dashboard/employee-database?view=employees" />
          <StatCard label="Departments" value={String(stats.departments)} href="/dashboard/org-chart" />
          <StatCard label="Documents on file" value={String(stats.documents)} href="/dashboard/employee-database?view=documents" />
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
