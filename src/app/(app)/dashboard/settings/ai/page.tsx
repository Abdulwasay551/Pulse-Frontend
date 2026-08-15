"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, Check, Plus, Star, Trash2, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useAiStatus } from "@/lib/ai-status-context";
import Modal from "@/components/dashboard/Modal";
import {
  aiCredentialsApi,
  getAiFeatureSettings,
  getAiProviderCatalog,
  setAiFeatureOverride,
  setDefaultAiCredential,
  testAiCredential,
  type AICredential,
  type AIFeatureSetting,
  type AIProvider,
  type AIProviderCatalogEntry,
} from "@/lib/ai-api";
import { ApiError } from "@/lib/auth-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

interface FormState {
  provider: AIProvider;
  label: string;
  base_url: string;
  model: string;
  api_key: string;
}

const emptyForm: FormState = { provider: "openai", label: "", base_url: "", model: "", api_key: "" };

export default function AiIntegrationsPage() {
  const { withAuth } = useAuth();
  const { refresh } = useAiStatus();
  const [credentials, setCredentials] = useState<AICredential[]>([]);
  const [catalog, setCatalog] = useState<Record<AIProvider, AIProviderCatalogEntry> | null>(null);
  const [features, setFeatures] = useState<AIFeatureSetting[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<Record<number, { ok: boolean; detail: string } | "testing">>({});

  async function load() {
    try {
      const [creds, cat, feats] = await withAuth((token) =>
        Promise.all([aiCredentialsApi.list(token), getAiProviderCatalog(token), getAiFeatureSettings(token)])
      );
      setCredentials(creds);
      setCatalog(cat);
      setFeatures(feats);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await withAuth((token) =>
        aiCredentialsApi.create(token, {
          provider: form.provider,
          label: form.label,
          base_url: form.provider === "openai_compatible" ? form.base_url : "",
          model: form.model,
          api_key: form.api_key,
        })
      );
      setShowForm(false);
      await load();
      refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSetDefault(id: number) {
    await withAuth((token) => setDefaultAiCredential(token, id));
    await load();
    refresh();
  }

  async function handleTest(id: number) {
    setTestStatus((s) => ({ ...s, [id]: "testing" }));
    const result = await withAuth((token) => testAiCredential(token, id));
    setTestStatus((s) => ({ ...s, [id]: result }));
  }

  async function handleDelete(c: AICredential) {
    if (!confirm(`Remove ${catalog?.[c.provider]?.label ?? c.provider} (${c.label || c.model})?`)) return;
    await withAuth((token) => aiCredentialsApi.remove(token, c.id));
    await load();
    refresh();
  }

  async function handleOverrideChange(featureKey: string, value: string) {
    await withAuth((token) => setAiFeatureOverride(token, featureKey, value ? Number(value) : null));
    await load();
    refresh();
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard/settings"
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Settings
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">AI Integrations</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Bring your own API key from OpenAI, Claude, Gemini, OpenRouter, DeepSeek, or any OpenAI-compatible provider.
            Set one as the default for every AI feature, or pin a specific feature to a different provider below.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
        >
          <Plus className="h-4 w-4" /> Add provider
        </button>
      </div>

      <h2 className="mb-3 font-display text-sm font-bold text-ink uppercase tracking-wide">Connected providers</h2>
      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : credentials.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          No AI providers connected yet. Every AI feature in the app shows a locked preview until you add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {credentials.map((c) => {
            const test = testStatus[c.id];
            return (
              <div key={c.id} className="rounded-2xl border border-line bg-card p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Bot className="h-4.5 w-4.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink">
                        {catalog?.[c.provider]?.label ?? c.provider}
                      </div>
                      <div className="truncate text-xs text-ink-soft">{c.label || c.model}</div>
                    </div>
                  </div>
                  {c.is_default && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-[10.5px] font-semibold text-primary">
                      <Star className="h-3 w-3" /> Default
                    </span>
                  )}
                </div>
                <div className="mb-3 flex items-center justify-between text-xs text-ink-soft">
                  <span>{c.model}</span>
                  <span>•••• {c.key_last4}</span>
                </div>
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
                  {!c.is_default && (
                    <button
                      onClick={() => handleSetDefault(c.id)}
                      className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-dim"
                    >
                      Set as default
                    </button>
                  )}
                  <button
                    onClick={() => handleTest(c.id)}
                    disabled={test === "testing"}
                    className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-dim disabled:opacity-60"
                  >
                    {test === "testing" ? "Testing…" : "Test"}
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
                    aria-label={`Remove ${c.label || c.model}`}
                    className="ml-auto rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="mt-8 mb-3 font-display text-sm font-bold text-ink uppercase tracking-wide">Feature overrides</h2>
      <div className="overflow-hidden rounded-2xl border border-line bg-card">
        <table className="eh-table w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3 font-medium">Feature</th>
              <th className="px-5 py-3 font-medium">Module</th>
              <th className="px-5 py-3 font-medium">Provider</th>
            </tr>
          </thead>
          <tbody>
            {features.map((f) => (
              <tr key={f.feature_key} className="border-b border-line last:border-0">
                <td className="px-5 py-3.5 font-semibold text-ink" data-label="Feature">{f.label}</td>
                <td className="px-5 py-3.5 text-ink-soft" data-label="Module">{f.module}</td>
                <td className="px-5 py-3.5" data-label="Provider">
                  <select
                    value={f.override_credential ?? ""}
                    onChange={(e) => handleOverrideChange(f.feature_key, e.target.value)}
                    className={inputClass}
                  >
                    <option value="">
                      Use default{f.effective_credential ? ` (${f.effective_credential.model})` : " (none connected)"}
                    </option>
                    {credentials.map((c) => (
                      <option key={c.id} value={c.id}>
                        {catalog?.[c.provider]?.label ?? c.provider} — {c.model}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && catalog && (
        <Modal title="Add AI provider" onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
                {error}
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Provider</label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value as AIProvider, model: "" })}
                className={inputClass}
              >
                {Object.entries(catalog).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
            {catalog[form.provider]?.requires_base_url && (
              <div className="mb-4">
                <label className={labelClass}>Base URL</label>
                <input
                  required
                  type="url"
                  value={form.base_url}
                  onChange={(e) => setForm({ ...form, base_url: e.target.value })}
                  placeholder="https://api.example.com/v1/chat/completions"
                  className={inputClass}
                />
              </div>
            )}
            <div className="mb-4">
              <label className={labelClass}>Label (optional)</label>
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Team OpenAI key"
                className={inputClass}
              />
            </div>
            <div className="mb-4">
              <label className={labelClass}>Model</label>
              <input
                required
                list="ai-model-suggestions"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="e.g. gpt-5.1-mini"
                className={inputClass}
              />
              <datalist id="ai-model-suggestions">
                {catalog[form.provider]?.suggested_models.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
            <div className="mb-6">
              <label className={labelClass}>API key</label>
              <input
                required
                type="password"
                value={form.api_key}
                onChange={(e) => setForm({ ...form, api_key: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {saving ? "Connecting…" : "Connect provider"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
