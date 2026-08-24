"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  FileSignature,
  Hash,
  MessageSquare,
  Plug,
  ShieldCheck,
  Smartphone,
  Trash2,
  Video,
  Webhook as WebhookIcon,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Modal from "@/components/dashboard/Modal";
import {
  getIntegrationCatalog,
  integrationConnectionsApi,
  testIntegrationConnection,
  type IntegrationCatalog,
  type IntegrationConnection,
  type IntegrationKey,
} from "@/lib/integrations-api";
import { ApiError } from "@/lib/auth-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

const INTEGRATION_ICONS: Record<IntegrationKey, typeof Hash> = {
  slack: Hash,
  teams: MessageSquare,
  webhook: WebhookIcon,
  twilio: Smartphone,
  zoom: Video,
  checkr: ShieldCheck,
  dropbox_sign: FileSignature,
};

export default function IntegrationsSettingsPage() {
  const { withAuth } = useAuth();
  const [catalog, setCatalog] = useState<IntegrationCatalog | null>(null);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<IntegrationKey | null>(null);
  const [testStatus, setTestStatus] = useState<Record<number, { ok: boolean; detail: string } | "testing">>({});

  async function load() {
    try {
      const [cat, conns] = await withAuth((token) =>
        Promise.all([getIntegrationCatalog(token), integrationConnectionsApi.list(token)])
      );
      setCatalog(cat);
      setConnections(conns);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleTest(id: number) {
    setTestStatus((s) => ({ ...s, [id]: "testing" }));
    const result = await withAuth((token) => testIntegrationConnection(token, id));
    setTestStatus((s) => ({ ...s, [id]: result }));
  }

  async function handleToggle(conn: IntegrationConnection) {
    await withAuth((token) => integrationConnectionsApi.update(token, conn.id, { is_enabled: !conn.is_enabled }));
    await load();
  }

  async function handleRemove(conn: IntegrationConnection) {
    if (!confirm(`Disconnect ${conn.label_display}? Notifications through it will stop immediately.`)) return;
    await withAuth((token) => integrationConnectionsApi.remove(token, conn.id));
    await load();
  }

  const connectionByKey = new Map(connections.map((c) => [c.integration_key, c]));
  const categories = catalog ? [...new Set(Object.values(catalog).map((m) => m.category))] : [];

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard/settings"
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Settings
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Integrations</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Connect Pulse to the tools you already use. Each one includes step-by-step instructions for where to find
          the key or URL it needs — nothing here requires touching code.
        </p>
      </div>

      {loading || !catalog ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : (
        categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="mb-3 font-display text-sm font-bold text-ink uppercase tracking-wide">{category}</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(Object.entries(catalog) as [IntegrationKey, IntegrationCatalog[IntegrationKey]][])
                .filter(([, meta]) => meta.category === category)
                .map(([key, meta]) => {
                  const Icon = INTEGRATION_ICONS[key];
                  const conn = connectionByKey.get(key);
                  const test = conn ? testStatus[conn.id] : undefined;
                  return (
                    <div key={key} className="rounded-2xl border border-line bg-card p-5">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-ink">{meta.label}</div>
                            {conn && (
                              <div
                                className={`text-xs ${conn.is_enabled ? "text-primary" : "text-ink-soft"}`}
                              >
                                {conn.is_enabled ? "Connected" : "Connected (paused)"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="mb-3 text-xs text-ink-soft">{meta.description}</p>

                      {conn && (
                        <div className="mb-3 flex flex-col gap-1 rounded-lg border border-line bg-cream px-3 py-2 text-[11px] text-ink-soft">
                          {Object.entries(conn.masked_config).map(([field, value]) => (
                            <div key={field} className="flex justify-between gap-2">
                              <span className="capitalize">{field.replace(/_/g, " ")}</span>
                              <span className="truncate">{value}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {conn?.webhook_receiver_url && (
                        <div className="mb-3 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
                          <div className="mb-1 text-[11px] font-semibold text-ink">
                            Paste this into {meta.label}&apos;s webhook setting
                          </div>
                          <div className="flex items-center gap-1.5">
                            <code className="flex-1 truncate text-[10.5px] text-ink-soft">{conn.webhook_receiver_url}</code>
                            <button
                              type="button"
                              onClick={() => navigator.clipboard.writeText(conn.webhook_receiver_url!)}
                              aria-label="Copy webhook URL"
                              className="shrink-0 rounded p-1 text-ink-soft hover:bg-cream-dim hover:text-ink"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {test && test !== "testing" && (
                        <div
                          className={`mb-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs ${
                            test.ok ? "bg-primary/10 text-primary" : "bg-maroon-soft text-maroon"
                          }`}
                        >
                          {test.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                          {test.detail}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {conn ? (
                          <>
                            <button
                              onClick={() => handleTest(conn.id)}
                              disabled={test === "testing"}
                              className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-dim disabled:opacity-60"
                            >
                              {test === "testing" ? "Testing…" : "Test"}
                            </button>
                            <button
                              onClick={() => setEditingKey(key)}
                              className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-dim"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleToggle(conn)}
                              className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-dim"
                            >
                              {conn.is_enabled ? "Pause" : "Resume"}
                            </button>
                            <button
                              onClick={() => handleRemove(conn)}
                              aria-label={`Disconnect ${meta.label}`}
                              className="ml-auto rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setEditingKey(key)}
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-cream transition-colors hover:bg-primary-dark"
                          >
                            <Plug className="h-3.5 w-3.5" /> Connect
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ))
      )}

      {editingKey && catalog && (
        <IntegrationFormModal
          integrationKey={editingKey}
          meta={catalog[editingKey]}
          existing={connectionByKey.get(editingKey) ?? null}
          onClose={() => setEditingKey(null)}
          onSaved={async () => {
            setEditingKey(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function IntegrationFormModal({
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
