"use client";

import { Suspense, useEffect, useState } from "react";
import { Award, Download, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import { useTableSearch } from "@/lib/use-table-search";
import {
  RECOGNITION_TYPES,
  downloadRecognitionCertificate,
  employeesApi,
  recognitionsApi,
  recognitionsCsv,
  type Employee,
  type Recognition,
  type RecognitionType,
} from "@/lib/people-api";
import { ApiError } from "@/lib/auth-api";

const RECOGNITION_REQUIRED_FIELDS = ["employee"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

export default function RecognitionPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <RecognitionPage />
    </Suspense>
  );
}

function RecognitionPage() {
  const { withAuth } = useAuth();
  const [recognitions, setRecognitions] = useState<Recognition[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employee: "",
    recognition_type: RECOGNITION_TYPES[0] as RecognitionType,
    given_by: "",
    message: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  async function load() {
    try {
      const [r, e] = await withAuth((token) => Promise.all([recognitionsApi.list(token), employeesApi.list(token)]));
      setRecognitions(r);
      setEmployees(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useTableSearch(recognitions, (r) =>
    [r.employee_detail.name, r.recognition_type, r.given_by, r.message].filter(Boolean).join(" ")
  );

  function openCreate() {
    setForm({
      employee: employees[0] ? String(employees[0].id) : "",
      recognition_type: RECOGNITION_TYPES[0],
      given_by: "",
      message: "",
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await withAuth((token) =>
        recognitionsApi.create(token, {
          employee: Number(form.employee),
          recognition_type: form.recognition_type,
          given_by: form.given_by,
          message: form.message,
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

  async function handleDelete(r: Recognition) {
    if (!confirm("Remove this recognition?")) return;
    await withAuth((token) => recognitionsApi.remove(token, r.id));
    await load();
  }

  async function handleDownloadCertificate(r: Recognition) {
    setDownloadingId(r.id);
    try {
      await withAuth((token) => downloadRecognitionCertificate(token, r.id, r.employee_detail.name));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Couldn't download the certificate. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Recognition Programs</h1>
          <p className="mt-1 text-sm text-ink-soft">Celebrate wins, department by department.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={recognitionsCsv}
            resourceLabel="recognitions"
            requiredFields={RECOGNITION_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> Give recognition
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          No recognitions yet — give someone a shoutout.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r) => (
            <div key={r.id} className="group relative rounded-2xl border border-line bg-card p-5">
              <button
                onClick={() => handleDelete(r)}
                aria-label="Remove recognition"
                className="absolute top-4 right-4 rounded-lg p-1.5 text-ink-soft opacity-0 transition-opacity hover:bg-maroon-soft hover:text-maroon group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-soft text-amber">
                <Award className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap text-primary">
                {r.recognition_type}
              </span>
              <h3 className="mt-2 font-display text-base font-bold text-ink">{r.employee_detail.name}</h3>
              {r.message && <p className="mt-1.5 text-sm text-ink-soft">{r.message}</p>}
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-soft">
                <span>{r.given_by ? `— ${r.given_by}` : ""}</span>
                <span>{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => handleDownloadCertificate(r)}
                disabled={downloadingId === r.id}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-cream px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:bg-cream-dim disabled:opacity-60"
              >
                <Download className="h-3.5 w-3.5" /> {downloadingId === r.id ? "Downloading…" : "Download certificate"}
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <Modal title="Give recognition" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
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
              <label className={labelClass}>Recognition type</label>
              <select
                value={form.recognition_type}
                onChange={(e) => setForm({ ...form, recognition_type: e.target.value as RecognitionType })}
                className={inputClass}
              >
                {RECOGNITION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Given by</label>
              <input
                value={form.given_by}
                onChange={(e) => setForm({ ...form, given_by: e.target.value })}
                placeholder="Your name"
                className={inputClass}
              />
            </div>
            <div className="mb-6">
              <label className={labelClass}>Message (optional)</label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Give recognition"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
