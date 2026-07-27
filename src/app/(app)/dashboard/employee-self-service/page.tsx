"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { employeesApi, type Employee } from "@/lib/people-api";

function portalUrl(token: string) {
  if (typeof window === "undefined") return `/employee-portal/${token}`;
  return `${window.location.origin}/employee-portal/${token}`;
}

export default function EmployeeSelfServicePage() {
  const { withAuth } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  useEffect(() => {
    withAuth((token) => employeesApi.list(token))
      .then(setEmployees)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCopy(e: Employee) {
    await navigator.clipboard.writeText(portalUrl(e.portal_token));
    setCopiedId(e.id);
    setTimeout(() => setCopiedId((id) => (id === e.id ? null : id)), 1800);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Employee Self-Service</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every employee gets a stable, no-login profile link to check their own role, department, manager, and
          status — share it so they don&apos;t have to ask.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Profile link</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Employee">
                  <EmployeeLink employee={e} subtitle={e.job_title || "—"} />
                </td>
                <td className="max-w-xs px-5 py-3.5" data-label="Profile link">
                  <span className="block truncate text-xs text-ink-soft">{portalUrl(e.portal_token)}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleCopy(e)}
                      aria-label={`Copy profile link for ${e.name}`}
                      title="Copy link"
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      {copiedId === e.id ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                    <a
                      href={portalUrl(e.portal_token)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open profile for ${e.name}`}
                      title="Open profile"
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && employees.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No employees yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>
    </div>
  );
}
