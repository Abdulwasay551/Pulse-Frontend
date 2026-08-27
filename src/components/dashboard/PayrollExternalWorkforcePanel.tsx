"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getExternalWorkforce, type ExternalWorker, type ExternalWorkforceProvider } from "@/lib/payroll-benefits-api";
import { ApiError } from "@/lib/auth-api";

const PROVIDERS: { key: ExternalWorkforceProvider; label: string }[] = [
  { key: "deel", label: "Deel" },
  { key: "remote", label: "Remote" },
  { key: "gusto", label: "Gusto" },
];

// Completes the payroll integrations' flow past "connect and test": lets
// HR/Finance Admin actually pull the connected account's live workforce
// list without leaving the Payroll & Benefits dashboard. Read-only — this
// app has no "EOR worker" concept of its own to import these into.
export default function PayrollExternalWorkforcePanel() {
  const { withAuth } = useAuth();
  const [open, setOpen] = useState<ExternalWorkforceProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notConnected, setNotConnected] = useState(false);
  const [workers, setWorkers] = useState<ExternalWorker[] | null>(null);

  async function refresh(provider: ExternalWorkforceProvider) {
    setWorkers(null);
    setError(null);
    setNotConnected(false);
    setLoading(true);
    try {
      const data = await withAuth((token) => getExternalWorkforce(token, provider));
      setWorkers(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setNotConnected(true);
      } else {
        setError(err instanceof ApiError ? err.message : "Couldn't reach this provider. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function toggle(provider: ExternalWorkforceProvider) {
    if (open === provider) {
      setOpen(null);
      return;
    }
    setOpen(provider);
    refresh(provider);
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card">
      <div className="px-5 py-4">
        <h2 className="font-display text-sm font-bold text-ink">External workforce data</h2>
        <p className="mt-1 text-xs text-ink-soft">Pull your connected Deel, Remote, or Gusto account's live worker list, read-only.</p>
      </div>
      <div className="divide-y divide-line border-t border-line">
        {PROVIDERS.map(({ key, label }) => {
          const isOpen = open === key;
          return (
            <div key={key}>
              <button
                type="button"
                onClick={() => toggle(key)}
                className="flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-cream/60"
              >
                <span className="text-sm font-semibold text-ink">{label}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-line p-5">
                  {loading ? (
                    <div className="text-center text-sm text-ink-soft">Loading from {label}…</div>
                  ) : notConnected ? (
                    <div className="text-sm text-ink-soft">
                      {label} isn&apos;t connected yet.{" "}
                      <Link href="/dashboard/settings/integrations" className="font-semibold text-primary hover:underline">
                        Connect it in Settings →
                      </Link>
                    </div>
                  ) : error ? (
                    <div className="text-sm text-maroon">{error}</div>
                  ) : workers && workers.length === 0 ? (
                    <div className="text-sm text-ink-soft">No workers found in this {label} account.</div>
                  ) : workers ? (
                    <div className="flex flex-col gap-2">
                      {workers.map((w) => (
                        <div key={w.id} className="flex items-center justify-between gap-3 rounded-lg border border-line bg-cream/40 px-3.5 py-2.5">
                          <div className="min-w-0">
                            <div className="truncate text-sm text-ink">{w.name || "—"}</div>
                            {w.email ? <div className="truncate text-xs text-ink-soft">{String(w.email)}</div> : null}
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => refresh(key)}
                        className="mt-1 flex items-center gap-1.5 self-start text-xs font-semibold text-ink-soft hover:text-ink"
                      >
                        <RefreshCw className="h-3 w-3" /> Refresh
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
