"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Plug, X } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import IntegrationFormModal from "@/components/dashboard/IntegrationFormModal";
import {
  getIntegrationCatalog,
  integrationConnectionsApi,
  testIntegrationConnection,
  type IntegrationCatalog,
  type IntegrationConnection,
  type IntegrationKey,
} from "@/lib/integrations-api";

// A compact "connect this app" panel scoped to whichever integrations are
// relevant to the module dashboard it's mounted on (e.g. Wise/Deel/Remote/
// Gusto on Payroll & Benefits) — reuses the exact same catalog, connection
// records, and connect/edit form as the central Settings > Integrations
// page rather than a parallel implementation, so connecting from either
// place is the same action seen from two doors.
export default function ModuleIntegrationsCard({
  title,
  integrationKeys,
}: {
  title: string;
  integrationKeys: IntegrationKey[];
}) {
  const { withAuth } = useAuth();
  const [catalog, setCatalog] = useState<IntegrationCatalog | null>(null);
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<IntegrationKey | null>(null);
  const [testStatus, setTestStatus] = useState<Record<number, { ok: boolean; detail: string } | "testing">>({});

  async function load() {
    try {
      const [cat, conns] = await withAuth((token) => Promise.all([getIntegrationCatalog(token), integrationConnectionsApi.list(token)]));
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

  if (loading || !catalog) {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-card p-6 text-center text-sm text-ink-soft">Loading integrations…</div>
    );
  }

  const connectionByKey = new Map(connections.map((c) => [c.integration_key, c]));
  const entries = integrationKeys.filter((key) => catalog[key]);
  if (entries.length === 0) return null;

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 className="font-display text-sm font-bold text-ink">{title}</h2>
        <Link href="/dashboard/settings/integrations" className="text-xs font-semibold text-ink-soft hover:text-ink">
          Manage all →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-3 border-t border-line p-5 sm:grid-cols-2">
        {entries.map((key) => {
          const meta = catalog[key];
          const conn = connectionByKey.get(key);
          const test = conn ? testStatus[conn.id] : undefined;
          return (
            <div key={key} className="rounded-2xl border border-line bg-cream/40 p-4">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-semibold text-ink">{meta.label}</span>
                {conn && (
                  <span className={`shrink-0 text-xs ${conn.is_enabled ? "text-primary" : "text-ink-soft"}`}>
                    {conn.is_enabled ? "Connected" : "Paused"}
                  </span>
                )}
              </div>
              <p className="mb-3 text-xs text-ink-soft">{meta.description}</p>
              {test && test !== "testing" && (
                <div className={`mb-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs ${test.ok ? "bg-primary/10 text-primary" : "bg-maroon-soft text-maroon"}`}>
                  {test.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  {test.detail}
                </div>
              )}
              {conn ? (
                <div className="flex items-center gap-2">
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
                </div>
              ) : (
                <button
                  onClick={() => setEditingKey(key)}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-cream transition-colors hover:bg-primary-dark"
                >
                  <Plug className="h-3.5 w-3.5" /> Connect
                </button>
              )}
            </div>
          );
        })}
      </div>

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
