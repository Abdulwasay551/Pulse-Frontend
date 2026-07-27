"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import { employeesApi, type Employee } from "@/lib/people-api";
import { assetsApi, assetIncidentsApi, type Asset, type AssetIncident, type IncidentType } from "@/lib/it-assets-api";
import { ApiError } from "@/lib/auth-api";

const incidentTypeOptions: IncidentType[] = ["Damage", "Repair", "Loss", "Malfunction", "Other"];

const incidentTone: Record<IncidentType, string> = {
  Damage: "bg-maroon-soft text-maroon",
  Repair: "bg-amber-soft text-amber",
  Loss: "bg-maroon-soft text-maroon",
  Malfunction: "bg-amber-soft text-amber",
  Other: "bg-cream-dim text-ink-soft",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  asset: string;
  employee: string;
  incident_type: IncidentType;
  description: string;
  incident_date: string;
  cost: string;
}
const emptyForm: FormState = {
  asset: "",
  employee: "",
  incident_type: "Repair",
  description: "",
  incident_date: new Date().toISOString().slice(0, 10),
  cost: "0",
};

export default function DeviceTrackerPage() {
  const { withAuth } = useAuth();
  const [incidents, setIncidents] = useState<AssetIncident[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [i, a, e] = await withAuth((token) =>
        Promise.all([assetIncidentsApi.list(token), assetsApi.list(token), employeesApi.list(token)])
      );
      setIncidents(i);
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

  function openCreate() {
    setForm({ ...emptyForm, asset: assets[0] ? String(assets[0].id) : "" });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await withAuth((token) =>
        assetIncidentsApi.create(token, {
          asset: Number(form.asset),
          employee: form.employee ? Number(form.employee) : null,
          incident_type: form.incident_type,
          description: form.description,
          incident_date: form.incident_date,
          cost: form.cost,
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

  async function markResolved(i: AssetIncident) {
    await withAuth((token) => assetIncidentsApi.update(token, i.id, { resolved: true }));
    await load();
  }

  async function handleDelete(i: AssetIncident) {
    if (!confirm(`Delete this ${i.incident_type.toLowerCase()} record for ${i.asset_name}?`)) return;
    await withAuth((token) => assetIncidentsApi.remove(token, i.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Device Tracker</h1>
          <p className="mt-1 text-sm text-ink-soft">Issue history, repairs, and damage records.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> Log incident
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {incidents.map((i) => (
          <div key={i.id} className="group rounded-2xl border border-line bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${incidentTone[i.incident_type]}`}>
                    {i.incident_type}
                  </span>
                  <span className="font-semibold text-ink">{i.asset_name}</span>
                  <span className="text-xs text-ink-soft">{i.asset_tag}</span>
                  {i.resolved && <span className="text-[11px] font-semibold text-primary">Resolved</span>}
                </div>
                {i.description && <p className="mt-1.5 text-sm text-ink-soft">{i.description}</p>}
                <p className="mt-1 text-xs text-ink-soft">
                  {i.incident_date}
                  {i.employee_detail && ` · Reported by ${i.employee_detail.name}`}
                  {Number(i.cost) > 0 && ` · $${i.cost}`}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!i.resolved && (
                  <button
                    onClick={() => markResolved(i)}
                    aria-label="Mark resolved"
                    className="rounded-lg p-1.5 text-ink-soft hover:bg-primary/15 hover:text-primary"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(i)}
                  aria-label="Delete incident"
                  className="rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!loading && incidents.length === 0 && (
          <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
            No incidents logged yet.
          </div>
        )}
        {loading && <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title="Log incident" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Asset</label>
              <select required value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })} className={inputClass}>
                <option value="">Choose an asset</option>
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.asset_tag})
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Reported by (optional)</label>
              <select value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} className={inputClass}>
                <option value="">None</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Type</label>
                <select
                  value={form.incident_type}
                  onChange={(e) => setForm({ ...form, incident_type: e.target.value as IncidentType })}
                  className={inputClass}
                >
                  {incidentTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  value={form.incident_date}
                  onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Estimated / repair cost</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Log incident"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
