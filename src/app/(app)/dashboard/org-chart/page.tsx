"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { employeesApi, type Employee } from "@/lib/people-api";

function buildTree(employees: Employee[]) {
  const byManager = new Map<number | null, Employee[]>();
  for (const e of employees) {
    const key = e.manager;
    if (!byManager.has(key)) byManager.set(key, []);
    byManager.get(key)!.push(e);
  }
  return byManager;
}

function OrgNode({ employee, byManager, depth }: { employee: Employee; byManager: Map<number | null, Employee[]>; depth: number }) {
  const reports = byManager.get(employee.id) ?? [];
  return (
    <div className={depth > 0 ? "mt-3 ml-6 border-l border-line pl-5" : "mt-3"}>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-card p-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
          {employee.initials}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-ink">{employee.name}</div>
          <div className="truncate text-xs text-ink-soft">
            {employee.job_title || "—"}
            {employee.department ? ` · ${employee.department}` : ""}
          </div>
        </div>
        {reports.length > 0 && (
          <span className="ml-auto shrink-0 rounded-full bg-cream-dim px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">
            {reports.length} report{reports.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {reports.map((r) => (
        <OrgNode key={r.id} employee={r} byManager={byManager} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function OrgChartPage() {
  const { withAuth } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    withAuth((token) => employeesApi.list(token))
      .then(setEmployees)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byManager = buildTree(employees);
  const roots = byManager.get(null) ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Organizational Chart</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Reporting hierarchy across the company — set an employee&apos;s manager from the Employee Database to place
          them here.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : employees.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          No employees yet.
        </div>
      ) : roots.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          Every employee has a manager assigned — no top-of-chart roots to show. Check for a manager cycle.
        </div>
      ) : (
        <div>
          {roots.map((r) => (
            <OrgNode key={r.id} employee={r} byManager={byManager} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}
