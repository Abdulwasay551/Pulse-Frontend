"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import { assetsApi, byodComplianceApi, type Asset, type BYODCompliance, type BYODComplianceStatus } from "@/lib/it-assets-api";
import { ApiError } from "@/lib/auth-api";

const complianceOptions: BYODComplianceStatus[] = ["Compliant", "Non-Compliant", "Pending Review"];

const complianceTone: Record<BYODComplianceStatus, string> = {
  Compliant: "bg-primary/15 text-primary",
  "Non-Compliant": "bg-maroon-soft text-maroon",
  "Pending Review": "bg-amber-soft text-amber",
};

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  asset: string;
  encryption_enabled: boolean;
  antivirus_installed: boolean;
  passcode_enabled: boolean;
  compliance_status: BYODComplianceStatus;
  last_checked: string;
  notes: string;
}
const emptyForm: FormState = {
  asset: "",
  encryption_enabled: false,
  antivirus_installed: false,
  passcode_enabled: false,
  compliance_status: "Pending Review",
  last_checked: new Date().toISOString().slice(0, 10),
  notes: "",
};

export default function ByodPolicyPage() {
  const { withAuth } = useAuth();
  const [checks, setChecks] = useState<BYODCompliance[]>([]);
  const [byodAssets, setByodAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [c, a] = await withAuth((token) => Promise.all([byodComplianceApi.list(token), assetsApi.list(token)]));
      setChecks(c);
      setByodAssets(a.filter((asset) => asset.is_byod));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setForm({ ...emptyForm, asset: byodAssets[0] ? String(byodAssets[0].id) : "" });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const asset = byodAssets.find((a) => String(a.id) === form.asset);
    if (!asset?.assigned_to) {
      setError("That device isn't assigned to an employee yet — provision it first.");
      setSaving(false);
      return;
    }
    try {
      await withAuth((token) =>
        byodComplianceApi.create(token, {
          asset: Number(form.asset),
          employee: asset.assigned_to as number,
          encryption_enabled: form.encryption_enabled,
          antivirus_installed: form.antivirus_installed,
          passcode_enabled: form.passcode_enabled,
          compliance_status: form.compliance_status,
          last_checked: form.last_checked,
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

  async function handleDelete(c: BYODCompliance) {
    if (!confirm(`Delete the BYOD compliance check for ${c.employee_detail.name}?`)) return;
    await withAuth((token) => byodComplianceApi.remove(token, c.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">BYOD Security Policy</h1>
          <p className="mt-1 text-sm text-ink-soft">Track policy compliance per personal device.</p>
        </div>
        <button
          onClick={openCreate}
          disabled={byodAssets.length === 0}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> New compliance check
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Device</th>
              <th className="px-5 py-3 font-medium">Encryption</th>
              <th className="px-5 py-3 font-medium">Antivirus</th>
              <th className="px-5 py-3 font-medium">Passcode</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5 font-semibold text-ink">{c.employee_detail.name}</td>
                <td className="px-5 py-3.5 text-ink-soft">{c.asset_tag}</td>
                <td className="px-5 py-3.5">{c.encryption_enabled ? "✓" : "—"}</td>
                <td className="px-5 py-3.5">{c.antivirus_installed ? "✓" : "—"}</td>
                <td className="px-5 py-3.5">{c.passcode_enabled ? "✓" : "—"}</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${complianceTone[c.compliance_status]}`}>
                    {c.compliance_status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => handleDelete(c)}
                      aria-label={`Delete compliance check for ${c.employee_detail.name}`}
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
        {!loading && checks.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">
            No BYOD compliance checks yet. Mark a device as BYOD on{" "}
            <Link href="/dashboard/asset-inventory" className="text-primary hover:underline">
              Asset Inventory
            </Link>{" "}
            first.
          </div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title="New compliance check" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>BYOD device</label>
              <select required value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })} className={inputClass}>
                <option value="">Choose a device</option>
                {byodAssets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.assigned_to_detail?.name ?? "unassigned"}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4 flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.encryption_enabled}
                  onChange={(e) => setForm({ ...form, encryption_enabled: e.target.checked })}
                />
                Disk encryption enabled
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.antivirus_installed}
                  onChange={(e) => setForm({ ...form, antivirus_installed: e.target.checked })}
                />
                Antivirus installed
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.passcode_enabled}
                  onChange={(e) => setForm({ ...form, passcode_enabled: e.target.checked })}
                />
                Passcode / biometric lock enabled
              </label>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Compliance status</label>
                <select
                  value={form.compliance_status}
                  onChange={(e) => setForm({ ...form, compliance_status: e.target.value as BYODComplianceStatus })}
                  className={inputClass}
                >
                  {complianceOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Last checked</label>
                <input
                  type="date"
                  value={form.last_checked}
                  onChange={(e) => setForm({ ...form, last_checked: e.target.value })}
                  className={inputClass}
                />
              </div>
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
              {saving ? "Saving…" : "Save compliance check"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
