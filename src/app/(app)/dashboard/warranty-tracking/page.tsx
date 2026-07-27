"use client";

import { useEffect, useMemo, useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import AssetLink from "@/components/dashboard/AssetLink";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { useAuth } from "@/lib/auth-context";
import { assetsApi, type Asset, type WarrantyStatus } from "@/lib/it-assets-api";

const warrantyTone: Record<WarrantyStatus, string> = {
  Active: "bg-primary/15 text-primary",
  "Expiring Soon": "bg-amber-soft text-amber",
  Expired: "bg-maroon-soft text-maroon",
  Unknown: "bg-cream-dim text-ink-soft",
};

const filterOptions: (WarrantyStatus | "All")[] = ["All", "Active", "Expiring Soon", "Expired", "Unknown"];

export default function WarrantyTrackingPage() {
  const { withAuth } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WarrantyStatus | "All">("All");

  useEffect(() => {
    withAuth((token) => assetsApi.list(token))
      .then(setAssets)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const result: Record<WarrantyStatus, number> = { Active: 0, "Expiring Soon": 0, Expired: 0, Unknown: 0 };
    for (const a of assets) result[a.warranty_status] += 1;
    return result;
  }, [assets]);

  const filtered = filter === "All" ? assets : assets.filter((a) => a.warranty_status === filter);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Warranty Tracking</h1>
        <p className="mt-1 text-sm text-ink-soft">Know what&apos;s covered, and until when.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active warranties" value={String(counts.Active)} />
        <StatCard label="Expiring soon (60 days)" value={String(counts["Expiring Soon"])} />
        <StatCard label="Expired" value={String(counts.Expired)} valueTone={counts.Expired > 0 ? "maroon" : "ink"} />
      </div>

      <div className="mb-4 flex gap-2">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              filter === f ? "bg-primary text-cream" : "bg-cream-dim text-ink-soft hover:text-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Asset</th>
              <th className="px-5 py-3 font-medium">Assigned to</th>
              <th className="px-5 py-3 font-medium">Warranty expiry</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Asset">
                  <AssetLink asset={a} />
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Assigned to">
                  {a.assigned_to_detail ? <EmployeeLink employee={a.assigned_to_detail} /> : "—"}
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft" data-label="Warranty expiry">{a.warranty_expiry ?? "Not recorded"}</td>
                <td className="px-5 py-3.5" data-label="Status">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${warrantyTone[a.warranty_status]}`}>
                    {a.warranty_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No assets match this filter.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>
    </div>
  );
}
