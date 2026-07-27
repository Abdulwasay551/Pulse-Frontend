"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Pencil, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { employeesApi, type Employee } from "@/lib/people-api";
import { bankAccountsApi, type BankAccount, type BankAccountType } from "@/lib/payroll-benefits-api";
import { ApiError } from "@/lib/auth-api";

const accountTypeOptions: BankAccountType[] = ["Checking", "Savings"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  employee: string;
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  routing_number: string;
  account_type: BankAccountType;
  is_primary: boolean;
  verified: boolean;
}

const emptyForm: FormState = {
  employee: "",
  bank_name: "",
  account_holder_name: "",
  account_number: "",
  routing_number: "",
  account_type: "Checking",
  is_primary: true,
  verified: false,
};

export default function DirectDepositPage() {
  const { withAuth } = useAuth();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<BankAccount | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [a, e] = await withAuth((token) => Promise.all([bankAccountsApi.list(token), employeesApi.list(token)]));
      setAccounts(a);
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
    setEditing(null);
    setForm({ ...emptyForm, employee: employees[0] ? String(employees[0].id) : "" });
    setError(null);
    setShowForm(true);
  }

  function openEdit(a: BankAccount) {
    setEditing(a);
    setForm({
      employee: String(a.employee),
      bank_name: a.bank_name,
      account_holder_name: a.account_holder_name,
      account_number: "",
      routing_number: a.routing_number,
      account_type: a.account_type,
      is_primary: a.is_primary,
      verified: a.verified,
    });
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const payload: Record<string, unknown> = {
      employee: Number(form.employee),
      bank_name: form.bank_name,
      account_holder_name: form.account_holder_name,
      routing_number: form.routing_number,
      account_type: form.account_type,
      is_primary: form.is_primary,
      verified: form.verified,
    };
    if (form.account_number) payload.account_number = form.account_number;
    try {
      if (editing) {
        await withAuth((token) => bankAccountsApi.update(token, editing.id, payload));
      } else {
        if (!form.account_number) throw new ApiError("Account number is required.", 400);
        await withAuth((token) => bankAccountsApi.create(token, payload as never));
      }
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(a: BankAccount) {
    if (!confirm(`Remove ${a.bank_name} ••••${a.account_number_last4} for ${a.employee_detail.name}?`)) return;
    await withAuth((token) => bankAccountsApi.remove(token, a.id));
    await load();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Direct Deposit / Banking Integration</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Bank details used for payouts. Only the last 4 digits are ever stored or shown.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> Add bank account
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Bank</th>
              <th className="px-5 py-3 font-medium">Account</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} className="group border-b border-line last:border-0 hover:bg-cream/60">
                <td className="px-5 py-3.5 font-semibold text-ink" data-label="Employee">
                  <EmployeeLink employee={a.employee_detail} />
                </td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Bank">{a.bank_name}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Account">•••• {a.account_number_last4}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Type">
                  {a.account_type}
                  {a.is_primary && <span className="ml-1.5 text-[10px] font-semibold text-primary">Primary</span>}
                </td>
                <td className="px-5 py-3.5" data-label="Status">
                  {a.verified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
                      <BadgeCheck className="h-3 w-3" /> Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-soft px-2.5 py-1 text-[11px] font-semibold text-amber">
                      <ShieldAlert className="h-3 w-3" /> Unverified
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="eh-row-actions flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(a)}
                      aria-label={`Edit bank account for ${a.employee_detail.name}`}
                      className="rounded-lg p-1.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(a)}
                      aria-label={`Delete bank account for ${a.employee_detail.name}`}
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
        {!loading && accounts.length === 0 && (
          <div className="p-10 text-center text-sm text-ink-soft">No bank accounts on file yet.</div>
        )}
        {loading && <div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}
      </div>

      {showForm && (
        <Modal title={editing ? "Edit bank account" : "New bank account"} onClose={() => setShowForm(false)}>
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
              <label className={labelClass}>Bank name</label>
              <input
                required
                value={form.bank_name}
                onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Account holder name</label>
              <input
                required
                value={form.account_holder_name}
                onChange={(e) => setForm({ ...form, account_holder_name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>{editing ? "New account number (optional)" : "Account number"}</label>
                <input
                  type="password"
                  value={form.account_number}
                  onChange={(e) => setForm({ ...form, account_number: e.target.value })}
                  placeholder={editing ? "Leave blank to keep current" : ""}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Routing number</label>
                <input
                  value={form.routing_number}
                  onChange={(e) => setForm({ ...form, routing_number: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="mb-4">
              <label className={labelClass}>Account type</label>
              <select
                value={form.account_type}
                onChange={(e) => setForm({ ...form, account_type: e.target.value as BankAccountType })}
                className={inputClass}
              >
                {accountTypeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6 flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.is_primary}
                  onChange={(e) => setForm({ ...form, is_primary: e.target.checked })}
                />
                Primary account
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.verified}
                  onChange={(e) => setForm({ ...form, verified: e.target.checked })}
                />
                Verified
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : editing ? "Save changes" : "Add bank account"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
