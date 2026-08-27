"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import {
  integrationConnectionsApi,
  type IntegrationCatalog,
  type IntegrationConnection,
  type IntegrationKey,
} from "@/lib/integrations-api";
import { ApiError } from "@/lib/auth-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

// Shared by the central Settings > Integrations page and any per-module
// dashboard card (e.g. Payroll & Benefits) that wants to connect the same
// underlying integration without duplicating this form.
export default function IntegrationFormModal({
  integrationKey,
  meta,
  existing,
  onClose,
  onSaved,
}: {
  integrationKey: IntegrationKey;
  meta: IntegrationCatalog[IntegrationKey];
  existing: IntegrationConnection | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { withAuth } = useAuth();
  const [label, setLabel] = useState(existing?.label ?? "");
  const [values, setValues] = useState<Record<string, string>>(
    () => Object.fromEntries(meta.fields.map((f) => [f.name, existing?.masked_config[f.name] ?? ""]))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setError(null);
    setSaving(true);
    try {
      if (existing) {
        await withAuth((token) =>
          integrationConnectionsApi.update(token, existing.id, { label, config: values })
        );
      } else {
        await withAuth((token) =>
          integrationConnectionsApi.create(token, { integration_key: integrationKey, label, config: values })
        );
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`${existing ? "Edit" : "Connect"} ${meta.label}`} onClose={onClose}>
      <div className="mb-5 rounded-lg border border-line bg-cream px-3.5 py-3 text-xs whitespace-pre-line text-ink-soft">
        {meta.setup_instructions}
      </div>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</div>
        )}
        <div className="mb-4">
          <label className={labelClass}>Label (optional)</label>
          <input
            value={label}
            onChange={(ev) => setLabel(ev.target.value)}
            placeholder={`e.g. "#hr-alerts"`}
            className={inputClass}
          />
        </div>
        {meta.fields.map((field) => (
          <div key={field.name} className="mb-4">
            <label className={labelClass}>{field.label}</label>
            <input
              required={field.required}
              type={field.type}
              value={values[field.name] ?? ""}
              onChange={(ev) => setValues({ ...values, [field.name]: ev.target.value })}
              placeholder={field.placeholder}
              className={inputClass}
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : existing ? "Save changes" : "Connect"}
        </button>
      </form>
    </Modal>
  );
}
