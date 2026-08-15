"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { employeesApi, type Employee } from "@/lib/people-api";
import { assetsApi, assetsCsv, type Asset, type AssetCategory, type AssetStatus } from "@/lib/it-assets-api";
import { ApiError } from "@/lib/auth-api";

const ASSET_REQUIRED_FIELDS = ["asset_tag", "name"];

const categoryOptions: AssetCategory[] = ["Laptop", "Monitor", "Phone", "Tablet", "Peripheral", "Other"];
const statusOptions: AssetStatus[] = ["In Stock", "Assigned", "In Repair", "Retired"];

const statusTone: Record<AssetStatus, string> = {
  "In Stock": "bg-cream-dim text-ink-soft",
  Assigned: "bg-primary/15 text-primary",
  "In Repair": "bg-amber-soft text-amber",
  Retired: "bg-maroon-soft text-maroon",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  asset_tag: string;
  name: string;
  category: AssetCategory;
  serial_number: string;
  purchase_date: string;
  warranty_expiry: string;
  status: AssetStatus;
  assigned_to: string;
  is_byod: boolean;
  notes: string;
}

const emptyForm: FormState = {
  asset_tag: "",
  name: "",
  category: "Laptop",
  serial_number: "",
  purchase_date: "",
  warranty_expiry: "",
  status: "In Stock",
  assigned_to: "",
  is_byod: false,
  notes: "",
};

export default function AssetInventoryPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <AssetInventoryPage />
    </Suspense>
  );
}

function AssetInventoryPage() {
  const searchParams = useSearchParams();
  const autoOpenedRef = useRef(false);
  const { withAuth } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Asset | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [a, e] = await withAuth((token) => Promise.all([assetsApi.list(token), employeesApi.list(token)]));
      setAssets(a);
      setEmployees(e);
      const assetParam = searchParams.get("asset");
      if (!autoOpenedRef.current && assetParam) {
        autoOpenedRef.current = true;
        const target = a.find((asset) => String(asset.id) === assetParam);
        if (target) openEdit(target);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  function openEdit(a: Asset) {
    setEditing(a);
    setForm({
      asset_tag: a.asset_tag,
      name: a.name,
      category: a.category,
      serial_number: a.serial_number,
      purchase_date: a.purchase_date ?? "",
      warranty_expiry: a.warranty_expiry ?? "",
      status: a.status,
      assigned_to: a.assigned_to ? String(a.assigned_to) : "",
      is_byod: a.is_byod,
      notes: a.notes,
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      asset_tag: form.asset_tag,
      name: form.name,
      category: form.category,
      serial_number: form.serial_number,
      purchase_date: form.purchase_date || null,
      warranty_expiry: form.warranty_expiry || null,
      status: form.status,
      assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      is_byod: form.is_byod,
      notes: form.notes,
    };
    try {
      if (editing) {
        await withAuth((token) => assetsApi.update(token, editing.id, payload));
      } else {
        await withAuth((token) => assetsApi.create(token, payload));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: Asset) {
    if (!confirm(`Delete asset "${a.name}" (${a.asset_tag})?`)) return;
    await withAuth((token) => assetsApi.remove(token, a.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Asset Inventory Tracking</h1>
          <p className="mt-1 text-sm text-ink-soft">Laptops, monitors, and every assigned device.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar csv={assetsCsv} resourceLabel="assets" requiredFields={ASSET_REQUIRED_FIELDS} onImported={load} />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New asset
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Asset</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Assigned to</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => (
              <tr key={a.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5" data-label="Asset">
                  <button onClick={() => openEdit(a)} className="text-left">
                    <div className="font-semibold text-ink hover:text-primary hover:underline">{a.name}</div>
                    <div className="text-xs text-ink-soft">{a.asset_tag}{a.is_byod && " · BYOD"}</div>
                  </button>
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Category">{a.category}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Assigned to">
                  {a.assigned_to_detail ? <EmployeeLink employee={a.assigned_to_detail} /> : "—"}
                </td>
                <td className="px-5 py-3.5" data-label="Status">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[a.status]}`}>
                    {a.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(a)}
                      aria-label={`Edit ${a.name}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      aria-label={`Delete ${a.name}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && assets.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No assets tracked yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit asset" : "New asset"} onClose={() => setShowForm(false)} wide>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Asset tag</label>
                <input
                  required
                  value={form.asset_tag}
                  onChange={(e) => setForm({ ...form, asset_tag: e.target.value })}
                  placeholder="PLS-LT-1042"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder='MacBook Pro 14"'
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as AssetCategory })}
                  className={inputClass}
                >
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Serial number</label>
                <input
                  value={form.serial_number}
                  onChange={(e) => setForm({ ...form, serial_number: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Purchase date</label>
                <input
                  type="date"
                  value={form.purchase_date}
                  onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Warranty expiry</label>
                <input
                  type="date"
                  value={form.warranty_expiry}
                  onChange={(e) => setForm({ ...form, warranty_expiry: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as AssetStatus })}
                  className={inputClass}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Assigned to</label>
                <select
                  value={form.assigned_to}
                  onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.is_byod}
                  onChange={(e) => setForm({ ...form, is_byod: e.target.checked })}
                />
                This is a personal (BYOD) device
              </label>
            </div>
            <div className="mb-6">
              <label className={labelClass}>Notes</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add asset"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
