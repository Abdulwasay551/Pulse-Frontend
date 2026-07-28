"use client";

import { useEffect, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureTile from "@/components/dashboard/FeatureTile";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules, featureHref } from "@/lib/dashboard-modules";
import { attendanceRecordsApi, leaveRequestsApi, shiftsApi } from "@/lib/people-api";

const moduleDef = dashboardModules.find((m) => m.key === "people")!;
const section = moduleDef.sections.find((s) => s.label === "Attendance Management")!;

export default function AttendanceManagementHubPage() {
  const { withAuth } = useAuth();
  const [stats, setStats] = useState<{ records: number; overtime: number; pendingLeave: number; shifts: number } | null>(null);

  useEffect(() => {
    withAuth((token) => Promise.all([attendanceRecordsApi.list(token), leaveRequestsApi.list(token), shiftsApi.list(token)])).then(
      ([records, leave, shifts]) => {
        setStats({
          records: records.length,
          overtime: records.filter((r) => Number(r.overtime_hours) > 0).length,
          pendingLeave: leave.filter((l) => l.status === "Pending").length,
          shifts: shifts.length,
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
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Attendance records" value={String(stats.records)} href="/dashboard/attendance?view=clock" />
          <StatCard label="Overtime logged" value={String(stats.overtime)} href="/dashboard/attendance?view=overtime" />
          <StatCard label="Pending leave requests" value={String(stats.pendingLeave)} href="/dashboard/leave-requests" />
          <StatCard label="Shifts scheduled" value={String(stats.shifts)} href="/dashboard/shift-scheduling" />
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
