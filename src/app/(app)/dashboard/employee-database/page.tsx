"use client";

import { useEffect, useState } from "react";
import { FileText, KeyRound, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import CsvToolbar from "@/components/dashboard/CsvToolbar";
import {
  deleteEmployeeDocument,
  employeesApi,
  employeesCsv,
  uploadEmployeeDocument,
  type Employee,
  type EmployeeDocument,
  type EmployeeStatus,
} from "@/lib/people-api";
import { createEmployeeAccount, sendEmployeeInvite } from "@/lib/role-api";
import { ApiError } from "@/lib/auth-api";

const EMPLOYEE_REQUIRED_FIELDS = ["name"];

const statusTone: Record<EmployeeStatus, string> = {
  Active: "bg-primary/15 text-primary",
  "On Leave": "bg-amber-soft text-amber",
  Terminated: "bg-maroon-soft text-maroon",
};

const statusOptions: EmployeeStatus[] = ["Active", "On Leave", "Terminated"];
const docTypeOptions: EmployeeDocument["doc_type"][] = ["Contract", "Certification", "ID Proof", "Other"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  name: string;
  email: string;
  phone: string;
  job_title: string;
  department: string;
  manager: string;
  hire_date: string;
  status: EmployeeStatus;
}

const emptyForm: FormState = {
  name: "",
  email: "",
  phone: "",
  job_title: "",
  department: "",
  manager: "",
  hire_date: new Date().toISOString().slice(0, 10),
  status: "Active",
};

export default function EmployeeDatabasePage() {
  const { withAuth } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [docForm, setDocForm] = useState<{ title: string; doc_type: EmployeeDocument["doc_type"]; file: File | null }>({
    title: "",
    doc_type: "Other",
    file: null,
  });
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [loginTarget, setLoginTarget] = useState<Employee | null>(null);
  const [loginMode, setLoginMode] = useState<"invite" | "create">("invite");
  const [loginForm, setLoginForm] = useState({ email: "", username: "", password: "" });
  const [loginSaving, setLoginSaving] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginResult, setLoginResult] = useState<string | null>(null);

  async function load() {
    try {
      const data = await withAuth((token) => employeesApi.list(token));
      setEmployees(data);
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

  function openEdit(e: Employee) {
    setEditing(e);
    setForm({
      name: e.name,
      email: e.email,
      phone: e.phone,
      job_title: e.job_title,
      department: e.department,
      manager: e.manager ? String(e.manager) : "",
      hire_date: e.hire_date,
      status: e.status,
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    setSaving(true);
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      job_title: form.job_title,
      department: form.department,
      manager: form.manager ? Number(form.manager) : null,
      hire_date: form.hire_date,
      status: form.status,
    };
    try {
      if (editing) {
        const updated = await withAuth((token) => employeesApi.update(token, editing.id, payload));
        setEditing(updated);
      } else {
        await withAuth((token) => employeesApi.create(token, payload));
        setShowForm(false);
      }
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(e: Employee) {
    if (!confirm(`Remove ${e.name} from the employee database?`)) return;
    await withAuth((token) => employeesApi.remove(token, e.id));
    if (editing?.id === e.id) setShowForm(false);
    await load();
  }

  async function handleUploadDoc() {
    if (!editing || !docForm.file || !docForm.title) return;
    setUploadingDoc(true);
    try {
      await withAuth((token) =>
        uploadEmployeeDocument(token, {
          employee: editing.id,
          doc_type: docForm.doc_type,
          title: docForm.title,
          file: docForm.file!,
        })
      );
      setDocForm({ title: "", doc_type: "Other", file: null });
      const updated = await withAuth((token) => employeesApi.list(token));
      setEmployees(updated);
      setEditing(updated.find((e) => e.id === editing.id) ?? null);
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleDeleteDoc(docId: number) {
    if (!editing) return;
    await withAuth((token) => deleteEmployeeDocument(token, docId));
    const updated = await withAuth((token) => employeesApi.list(token));
    setEmployees(updated);
    setEditing(updated.find((e) => e.id === editing.id) ?? null);
  }

  function openLogin(e: Employee) {
    setLoginTarget(e);
    setLoginMode("invite");
    setLoginForm({ email: e.email, username: "", password: "" });
    setLoginError(null);
    setLoginResult(null);
  }

  async function handleSendInvite(ev: React.FormEvent) {
    ev.preventDefault();
    if (!loginTarget) return;
    setLoginError(null);
    setLoginSaving(true);
    try {
      await withAuth((token) => sendEmployeeInvite(token, { employee: loginTarget.id, email: loginForm.email }));
      setLoginResult(`Invite sent to ${loginForm.email}.`);
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : "Couldn't send the invite. Please try again.");
    } finally {
      setLoginSaving(false);
    }
  }

  async function handleCreateAccount(ev: React.FormEvent) {
    ev.preventDefault();
    if (!loginTarget) return;
    setLoginError(null);
    setLoginSaving(true);
    try {
      await withAuth((token) =>
        createEmployeeAccount(token, { employee: loginTarget.id, username: loginForm.username, password: loginForm.password })
      );
      setLoginResult(`Account created — username "${loginForm.username}". Share the password with them directly.`);
    } catch (err) {
      setLoginError(err instanceof ApiError ? err.message : "Couldn't create the account. Please try again.");
    } finally {
      setLoginSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Employee Database</h1>
          <p className="mt-1 text-sm text-ink-soft">360° employee profiles — contact info, role, manager, and documents.</p>
        </div>
        <div className="flex items-center gap-2">
          <CsvToolbar
            csv={employeesCsv}
            resourceLabel="employees"
            requiredFields={EMPLOYEE_REQUIRED_FIELDS}
            onImported={load}
          />
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4" /> New employee
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Manager</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Hired</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                      {e.initials}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-ink">{e.name}</div>
                      <div className="truncate text-xs text-ink-soft">{e.job_title || "—"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-ink-soft">{e.department || "—"}</td>
                <td className="px-5 py-3.5 text-ink-soft">{e.manager_name ?? "—"}</td>
                <td className="px-5 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ${statusTone[e.status]}`}
                  >
                    {e.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-soft">{e.hire_date}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openLogin(e)}
                      aria-label={`Manage login for ${e.name}`}
                      title="Manage login"
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => openEdit(e)}
                      aria-label={`Edit ${e.name}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(e)}
                      aria-label={`Delete ${e.name}`}
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
        {!loading && employees.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No employees yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title={editing ? editing.name : "New employee"} onClose={() => setShowForm(false)} wide>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(ev) => setForm({ ...form, name: ev.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Job title</label>
                <input
                  value={form.job_title}
                  onChange={(ev) => setForm({ ...form, job_title: ev.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(ev) => setForm({ ...form, email: ev.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  value={form.phone}
                  onChange={(ev) => setForm({ ...form, phone: ev.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Department</label>
                <input
                  value={form.department}
                  onChange={(ev) => setForm({ ...form, department: ev.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Manager</label>
                <select
                  value={form.manager}
                  onChange={(ev) => setForm({ ...form, manager: ev.target.value })}
                  className={inputClass}
                >
                  <option value="">—</option>
                  {employees
                    .filter((e) => !editing || e.id !== editing.id)
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Hire date</label>
                <input
                  type="date"
                  value={form.hire_date}
                  onChange={(ev) => setForm({ ...form, hire_date: ev.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={(ev) => setForm({ ...form, status: ev.target.value as EmployeeStatus })}
                  className={inputClass}
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add employee"}
            </button>
          </form>

          {editing && (
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="mb-3 font-display text-sm font-bold text-ink">Documents</h3>
              {editing.documents.length > 0 && (
                <div className="mb-4 flex flex-col gap-2">
                  {editing.documents.map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-line bg-cream px-3 py-2"
                    >
                      <a
                        href={d.file}
                        target="_blank"
                        rel="noreferrer"
                        className="flex min-w-0 items-center gap-2 text-sm text-primary hover:text-primary-dark"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{d.title}</span>
                        <span className="shrink-0 text-xs text-ink-soft">({d.doc_type})</span>
                      </a>
                      <button
                        onClick={() => handleDeleteDoc(d.id)}
                        aria-label={`Remove ${d.title}`}
                        className="shrink-0 rounded-lg p-1 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap items-end gap-2">
                <div className="min-w-[140px] flex-1">
                  <label className={labelClass}>Title</label>
                  <input
                    value={docForm.title}
                    onChange={(ev) => setDocForm({ ...docForm, title: ev.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Type</label>
                  <select
                    value={docForm.doc_type}
                    onChange={(ev) => setDocForm({ ...docForm, doc_type: ev.target.value as EmployeeDocument["doc_type"] })}
                    className={inputClass}
                  >
                    {docTypeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-cream px-3.5 py-2.5 text-xs font-semibold text-ink-soft hover:bg-cream-dim">
                  <Upload className="h-3.5 w-3.5" /> {docForm.file ? docForm.file.name.slice(0, 16) : "Choose file"}
                  <input
                    type="file"
                    className="hidden"
                    onChange={(ev) => setDocForm({ ...docForm, file: ev.target.files?.[0] ?? null })}
                  />
                </label>
                <button
                  onClick={handleUploadDoc}
                  disabled={uploadingDoc || !docForm.file || !docForm.title}
                  className="rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-50"
                >
                  {uploadingDoc ? "Uploading…" : "Upload"}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {loginTarget && (
        <Modal title={`Manage login · ${loginTarget.name}`} onClose={() => setLoginTarget(null)}>
          {loginResult ? (
            <div className="rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2.5 text-sm text-primary">{loginResult}</div>
          ) : (
            <>
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setLoginMode("invite")}
                  className={`flex-1 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${loginMode === "invite" ? "bg-primary text-cream" : "bg-cream text-ink-soft hover:bg-cream-dim"}`}
                >
                  Email invite
                </button>
                <button
                  onClick={() => setLoginMode("create")}
                  className={`flex-1 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${loginMode === "create" ? "bg-primary text-cream" : "bg-cream text-ink-soft hover:bg-cream-dim"}`}
                >
                  Set password directly
                </button>
              </div>

              {loginError && (
                <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{loginError}</div>
              )}

              {loginMode === "invite" ? (
                <form onSubmit={handleSendInvite}>
                  <p className="mb-4 text-sm text-ink-soft">
                    Sends a signup link to this address — they set their own password when they accept.
                  </p>
                  <div className="mb-6">
                    <label className={labelClass}>Email</label>
                    <input
                      required
                      type="email"
                      value={loginForm.email}
                      onChange={(ev) => setLoginForm({ ...loginForm, email: ev.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loginSaving}
                    className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
                  >
                    {loginSaving ? "Sending…" : "Send invite"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleCreateAccount}>
                  <p className="mb-4 text-sm text-ink-soft">Creates the login immediately — share the password with them yourself.</p>
                  <div className="mb-4">
                    <label className={labelClass}>Username</label>
                    <input
                      required
                      value={loginForm.username}
                      onChange={(ev) => setLoginForm({ ...loginForm, username: ev.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div className="mb-6">
                    <label className={labelClass}>Password</label>
                    <input
                      required
                      type="password"
                      value={loginForm.password}
                      onChange={(ev) => setLoginForm({ ...loginForm, password: ev.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loginSaving}
                    className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
                  >
                    {loginSaving ? "Creating…" : "Create account"}
                  </button>
                </form>
              )}
            </>
          )}
        </Modal>
      )}
    </div>
  );
}
