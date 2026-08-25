"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  Code2,
  Copy,
  FileSignature,
  Gamepad2,
  Globe2,
  Hash,
  Landmark,
  Mail,
  MessageSquare,
  Plug,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Trash2,
  Video,
  Webhook as WebhookIcon,
  X,
  Zap,
  BarChart3,
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
import { disconnectGoogle, getGoogleConnectUrl, getGoogleStatus, type GoogleStatus } from "@/lib/google-integration-api";
import { ApiError } from "@/lib/auth-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

const INTEGRATION_ICONS: Record<IntegrationKey, typeof Hash> = {
  slack: Hash,
  teams: MessageSquare,
  discord: Gamepad2,
  telegram: Send,
  webhook: WebhookIcon,
  twilio: Smartphone,
  smtp: Mail,
  zoom: Video,
  checkr: ShieldCheck,
  dropbox_sign: FileSignature,
  hackerrank: Code2,
  wise: Landmark,
  deel: Briefcase,
  remote: Globe2,
  zapier: Zap,
  surveymonkey: BarChart3,
};

// A little visual personality per category, beyond just a plain heading —
// each gets its own accent color for the header dot/count chip so the page
// reads as organized sections rather than one long undifferentiated list.
const CATEGORY_ACCENT: Record<string, string> = {
  Notifications: "bg-primary",
  Automation: "bg-amber",
  // bg-accent isn't a real token in this theme (only cream/ink/primary/
  // maroon/amber/line/card exist) — was rendering with no color at all.
  Email: "bg-primary-dark",
  // Maroon is reserved for error/critical states elsewhere in the app —
  // these get distinct decorative tones instead, not that one.
  Recruiting: "bg-primary-light",
  Payroll: "bg-ink-soft",
  People: "bg-ink",
};

export default function IntegrationsSettingsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-ink-soft">Loading…</div>}>
      <IntegrationsSettingsPage />
    </Suspense>
  );
}

function IntegrationsSettingsPage() {
  const searchParams = useSearchParams();
  const { withAuth } = useAuth();
  const [catalog, setCatalog] = useState<IntegrationCatalog | null>(null);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<IntegrationKey | null>(null);
  const [testStatus, setTestStatus] = useState<Record<number, { ok: boolean; detail: string } | "testing">>({});
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [googleCallbackNotice, setGoogleCallbackNotice] = useState<{ ok: boolean; message: string } | null>(null);

  async function load() {
    try {
      const [cat, conns, google] = await withAuth((token) =>
        Promise.all([getIntegrationCatalog(token), integrationConnectionsApi.list(token), getGoogleStatus(token)])
      );
      setCatalog(cat);
      setConnections(conns);
      setGoogleStatus(google);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const google = searchParams.get("google");
    if (google === "connected") {
      setGoogleCallbackNotice({ ok: true, message: "Google Calendar connected." });
      load();
    } else if (google === "error") {
      const detail = searchParams.get("detail");
      setGoogleCallbackNotice({ ok: false, message: detail ? `Couldn't connect Google Calendar: ${detail}` : "Couldn't connect Google Calendar." });
    }
    // Only ever fires from the URL Google's OAuth redirect lands on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConnectGoogle() {
    setConnectingGoogle(true);
    try {
      const { auth_url } = await withAuth((token) => getGoogleConnectUrl(token));
      window.location.href = auth_url;
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Couldn't start the Google connection. Please try again.");
      setConnectingGoogle(false);
    }
  }

  async function handleDisconnectGoogle() {
    if (!confirm("Disconnect Google Calendar? Orientation tasks will go back to downloadable .ics invites.")) return;
    await withAuth((token) => disconnectGoogle(token));
    await load();
  }

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
  const entries = useMemo(
    () => (catalog ? (Object.entries(catalog) as [IntegrationKey, IntegrationCatalog[IntegrationKey]][]) : []),
    [catalog]
  );
  const categories = useMemo(() => [...new Set(entries.map(([, meta]) => meta.category))], [entries]);

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;
  const matches = ([key, meta]: [IntegrationKey, IntegrationCatalog[IntegrationKey]]) =>
    !isSearching || meta.label.toLowerCase().includes(q) || meta.description.toLowerCase().includes(q) || key.includes(q);

  function toggleCategory(category: string) {
    setCollapsed((c) => ({ ...c, [category]: !c[category] }));
  }

  const totalConnected = connections.length + (googleStatus?.connected ? 1 : 0);
  const showGoogleCard = !isSearching || ["google", "calendar", "meet", "scheduling", "orientation"].some((kw) => kw.includes(q) || q.includes(kw));

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard/settings"
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Settings
      </Link>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Integrations</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Connect Pulse to the tools you already use. Each one includes step-by-step instructions for where to
            find the key or URL it needs — nothing here requires touching code.
          </p>
        </div>
        {!loading && (
          <span className="shrink-0 rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold text-ink-soft">
            {totalConnected} connected
          </span>
        )}
      </div>

      {googleCallbackNotice && (
        <div
          className={`mb-4 flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-sm ${
            googleCallbackNotice.ok ? "border-primary/30 bg-primary/5 text-ink" : "border-maroon/30 bg-maroon-soft text-maroon"
          }`}
        >
          <span>{googleCallbackNotice.message}</span>
          <button
            onClick={() => setGoogleCallbackNotice(null)}
            aria-label="Dismiss"
            className="shrink-0 rounded-full p-0.5 hover:bg-black/5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-ink-soft" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search integrations — Slack, e-signature, SMS…"
          className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="shrink-0 rounded-full p-0.5 text-ink-soft hover:bg-cream-dim hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {!loading && showGoogleCard && (
        <div className="mb-4 overflow-hidden rounded-2xl border border-line bg-card">
          <div className="flex items-center gap-2.5 px-5 py-4">
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
            <h2 className="font-display text-sm font-bold text-ink">Scheduling</h2>
            <span className="rounded-full bg-cream-dim px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">
              {googleStatus?.connected ? "1/1 connected" : 1}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 border-t border-line p-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-cream/40 p-5">
              <div className="mb-2 flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-ink">Google Calendar &amp; Meet</div>
                  {googleStatus?.connected && (
                    <div className="truncate text-xs text-primary">Connected — {googleStatus.email}</div>
                  )}
                </div>
              </div>
              <p className="mb-3 text-xs text-ink-soft">
                Sends real calendar invites with a live Meet link for Orientation onboarding tasks — replaces the
                downloadable .ics file with an actual event on your calendar.
              </p>
              <p className="mb-3 text-xs text-ink-soft/80">
                Unlike every other integration here, this connects through a real Google sign-in screen — there&apos;s
                no key or URL to paste.
              </p>
              <div className="flex items-center gap-2">
                {googleStatus?.connected ? (
                  <button
                    onClick={handleDisconnectGoogle}
                    className="rounded-lg border border-line bg-cream px-3 py-1.5 text-xs font-semibold text-ink-soft hover:bg-cream-dim"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleConnectGoogle}
                    disabled={connectingGoogle}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
                  >
                    <Plug className="h-3.5 w-3.5" /> {connectingGoogle ? "Redirecting…" : "Connect with Google"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {loading || !catalog ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : (
        categories.map((category) => {
          const categoryEntries = entries.filter(([, meta]) => meta.category === category);
          const visibleEntries = categoryEntries.filter(matches);
          if (visibleEntries.length === 0) return null;
          const connectedCount = categoryEntries.filter(([key]) => connectionByKey.has(key)).length;
          const isOpen = isSearching || !collapsed[category];

          return (
            <div key={category} className="mb-4 overflow-hidden rounded-2xl border border-line bg-card">
              <button
                type="button"
                onClick={() => toggleCategory(category)}
                disabled={isSearching}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-cream/60 disabled:cursor-default disabled:hover:bg-transparent"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${CATEGORY_ACCENT[category] ?? "bg-ink-soft"}`} />
                  <h2 className="font-display text-sm font-bold text-ink">{category}</h2>
                  <span className="rounded-full bg-cream-dim px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">
                    {connectedCount > 0 ? `${connectedCount}/${categoryEntries.length} connected` : categoryEntries.length}
                  </span>
                </div>
                {!isSearching && (
                  <ChevronDown className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${isOpen ? "rotate-180" : ""}`} />
                )}
              </button>

              {isOpen && (
                <div className="grid grid-cols-1 gap-3 border-t border-line p-5 sm:grid-cols-2">
                  {visibleEntries.map(([key, meta]) => {
                    const Icon = INTEGRATION_ICONS[key];
                    const conn = connectionByKey.get(key);
                    const test = conn ? testStatus[conn.id] : undefined;
                    return (
                      <div key={key} className="rounded-2xl border border-line bg-cream/40 p-5">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <Icon className="h-4.5 w-4.5" />
                            </span>
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-ink">{meta.label}</div>
                              {conn && (
                                <div className={`text-xs ${conn.is_enabled ? "text-primary" : "text-ink-soft"}`}>
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
              )}
            </div>
          );
        })
      )}

      {!loading && catalog && isSearching && categories.every((c) => entries.filter(([, m]) => m.category === c).filter(matches).length === 0) && (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          No integrations match &quot;{query}&quot;.
        </div>
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
