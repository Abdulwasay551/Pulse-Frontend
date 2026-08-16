"use client";

import { Suspense, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import AssetLink from "@/components/dashboard/AssetLink";
import PaginationFooter from "@/components/dashboard/PaginationFooter";
import { useTableSearch } from "@/lib/use-table-search";
import { usePagination } from "@/lib/use-pagination";
import { employeesApi, type Employee } from "@/lib/people-api";
import {
  assetsApi,
  assetRecoveriesApi,
  assetRecoveriesCsv,
  type Asset,
  type AssetRecovery,
  type RecoveryStatus,
} from "@/lib/it-assets-api";
import { ApiError } from "@/lib/auth-api";

const ASSET_RECOVERY_REQUIRED_FIELDS = ["employee", "asset"];

const statusOptions: RecoveryStatus[] = ["Pending", "Recovered", "Not Returned"];

const statusTone: Record<RecoveryStatus, string> = {
  Pending: "bg-amber-soft text-amber",
  Recovered: "bg-primary/15 text-primary",
  "Not Returned": "bg-maroon-soft text-maroon",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  employee: string;
  asset: string;
  last_working_day: string;
  notes: string;
}
const emptyForm: FormState = { employee: "", asset: "", last_working_day: new Date().toISOString().slice(0, 10), notes: "" };

export default function AssetRecoveryPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <AssetRecoveryPage />
    </Suspense>
  );
}

function AssetRecoveryPage() {
  const { withAuth } = useAuth();
  const [recoveries, setRecoveries] = useState<AssetRecovery[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [r, e, a] = await withAuth((token) =>
        Promise.all([assetRecoveriesApi.list(token), employeesApi.list(token), assetsApi.list(token)])
      );
      setRecoveries(r);
      setEmployees(e);
      setAssets(a);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only assets currently provisioned to someone are actually recoverable.
  const assignedAssets = assets.filter((a) => a.assigned_to);

  const searched = useTableSearch(recoveries, (r) =>
    [r.employee_detail.name, r.asset_name, r.asset_tag, r.status, r.notes].filter(Boolean).join(" ")
  );
  const { pageItems: visible, page, setPage, totalPages, total, pageSize } = usePagination(searched);

  function openCreate() {
    const firstAsset = assignedAssets[0];
    setForm({
      ...emptyForm,
      asset: firstAsset ? String(firstAsset.id) : "",
      employee: firstAsset?.assigned_to ? String(firstAsset.assigned_to) : "",
    });
    setError(null);
    setShowForm(true);
  }

  function selectAsset(assetId: string) {
    const asset = assignedAssets.find((a) => String(a.id) === assetId);
    setForm({ ...form, asset: assetId, employee: asset?.assigned_to ? String(asset.assigned_to) : form.employee });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await withAuth((token) =>
        assetRecoveriesApi.create(token, {
          employee: Number(form.employee),
          asset: Number(form.asset),
          last_working_day: form.last_working_day || null,
          notes: form.notes,
        })
      );
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(r: AssetRecovery, status: RecoveryStatus) {
    await withAuth((token) => assetRecoveriesApi.update(token, r.id, { status }));
    await load();
  }

  async function handleDelete(r: AssetRecovery) {
    if (!confirm(`Remove the recovery record for ${r.employee_detail.name} (${r.asset_tag})?`)) return;
    await withAuth((token) => assetRecoveriesApi.remove(token, r.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Offboarding Recovery</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Reclaim IT assets from departing employees. Marking a device Recovered unassigns it back into the provisioning pool.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={assetRecoveriesCsv}
            resourceLabel="asset recoveries"
            requiredFields={ASSET_RECOVERY_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            disabled={assignedAssets.length === 0}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
          >
            <Plus className="h-4 w-4" /> New recovery
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          No recovery records yet. Start one when an employee with a provisioned device is offboarding.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => (
            <div key={r.id} className="group relative rounded-2xl border border-line bg-card p-5">
              <button
                onClick={() => handleDelete(r)}
                aria-label={`Remove recovery record for ${r.employee_detail.name}`}
                className="absolute top-4 right-4 rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="mb-3">
                <EmployeeLink employee={r.employee_detail} />
              </div>
              <div className="mb-3 rounded-lg border border-line bg-cream px-3 py-2">
                <AssetLink asset={{ id: r.asset, name: r.asset_name, asset_tag: r.asset_tag }} />
              </div>
              <div className="flex items-center justify-between text-xs text-ink-soft">
                <span>Last working day</span>
                <span className="text-ink">{r.last_working_day ?? "—"}</span>
              </div>
              {r.notes && <p className="mt-2 text-xs text-ink-soft">{r.notes}</p>}
              <div className="mt-4">
                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r, e.target.value as RecoveryStatus)}
                  className={`w-full rounded-full border-0 px-2.5 py-1.5 text-center text-[11px] font-semibold ${statusTone[r.status]}`}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
      <PaginationFooter page={page} totalPages={totalPages} total={total} pageSize={pageSize} onPageChange={setPage} />

      {showForm && (
        <Modal title="New recovery record" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Provisioned asset</label>
              <select required value={form.asset} onChange={(e) => selectAsset(e.target.value)} className={inputClass}>
                <option value="">Choose an asset</option>
                {assignedAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.asset_tag}) — {a.assigned_to_detail?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Employee</label>
              <select
                required
                value={form.employee}
                onChange={(e) => setForm({ ...form, employee: e.target.value })}
                className={inputClass}
              >
                <option value="">Choose an employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Last working day</label>
              <input
                type="date"
                value={form.last_working_day}
                onChange={(e) => setForm({ ...form, last_working_day: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Collect at exit interview."
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Start recovery"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
