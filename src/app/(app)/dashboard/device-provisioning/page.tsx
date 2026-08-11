"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Laptop, UserCheck, UserX } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import AssetLink from "@/components/dashboard/AssetLink";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import StatCard from "@/components/dashboard/StatCard";
import { employeesApi, type Employee } from "@/lib/people-api";
import { assetsApi, type Asset } from "@/lib/it-assets-api";

const inputClass =
  "rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none";

export default function DeviceProvisioningPage() {
  const { withAuth } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState<Record<number, string>>({});

  async function load() {
    try {
      const [a, e] = await withAuth((token) => Promise.all([assetsApi.list(token), employeesApi.list(token)]));
      setAssets(a);
      setEmployees(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const available = assets.filter((a) => !a.assigned_to && a.status !== "Retired");
  const assigned = assets.filter((a) => a.assigned_to);
  const inRepair = assets.filter((a) => a.status === "In Repair").length;
  const retired = assets.filter((a) => a.status === "Retired").length;

  async function assign(asset: Asset) {
    const employeeId = assignTarget[asset.id];
    if (!employeeId) return;
    await withAuth((token) =>
      assetsApi.update(token, asset.id, {
        assigned_to: Number(employeeId),
        assigned_at: new Date().toISOString().slice(0, 10),
        status: "Assigned",
      })
    );
    await load();
  }

  async function unassign(asset: Asset) {
    if (!confirm(`Unassign ${asset.name} from ${asset.assigned_to_detail?.name}?`)) return;
    await withAuth((token) => assetsApi.update(token, asset.id, { assigned_to: null, status: "In Stock" }));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Device Provisioning</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Assign or reclaim devices — tied to onboarding and offboarding. Manage the full catalog on{" "}
          <Link href="/dashboard/asset-inventory" className="text-primary hover:underline">
            Asset Inventory
          </Link>
          .
        </p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Available to provision" value={String(available.length)} />
        <StatCard label="Currently provisioned" value={String(assigned.length)} />
        <StatCard label="In repair" value={String(inRepair)} />
        <StatCard label="Retired" value={String(retired)} />
      </div>

      <div className="mb-8">
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Available to provision</h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="eh-table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 font-medium">Asset</th>
                <th className="px-5 py-3 font-medium">Assign to</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {available.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3.5" data-label="Asset">
                    <div className="flex items-center gap-2">
                      <Laptop className="h-4 w-4 shrink-0 text-ink-soft" />
                      <AssetLink asset={a} />
                    </div>
                  </td>
                  <td className="px-5 py-3.5" data-label="Assign to">
                    <select
                      value={assignTarget[a.id] ?? ""}
                      onChange={(e) => setAssignTarget({ ...assignTarget, [a.id]: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Choose an employee</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => assign(a)}
                      disabled={!assignTarget[a.id]}
                      className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-cream hover:bg-primary-dark disabled:opacity-40"
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Provision
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && available.length === 0 && (
            <div className="p-8 text-center text-sm text-ink-soft">No unassigned devices in stock.</div>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-display text-lg font-bold text-ink">Currently provisioned</h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          <table className="eh-table w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3 font-medium">Asset</th>
                <th className="px-5 py-3 font-medium">Assigned to</th>
                <th className="px-5 py-3 font-medium">Since</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {assigned.map((a) => (
                <tr key={a.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                  <td className="px-5 py-3.5" data-label="Asset">
                    <AssetLink asset={a} />
                  </td>
                  <td className="px-5 py-3.5 text-ink-soft" data-label="Assigned to">
                    {a.assigned_to_detail && <EmployeeLink employee={a.assigned_to_detail} />}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Since">{a.assigned_at ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => unassign(a)}
                      className="flex items-center gap-1.5 rounded-lg bg-cream-dim px-3 py-2 text-xs font-semibold text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                    >
                      <UserX className="h-3.5 w-3.5" /> Unassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && assigned.length === 0 && (
            <div className="p-8 text-center text-sm text-ink-soft">No devices provisioned yet.</div>
          )}
          {loading && <div className="p-8 text-center text-sm text-ink-soft">Loading…</div>}
        </div>
      </div>
    </div>
  );
}
