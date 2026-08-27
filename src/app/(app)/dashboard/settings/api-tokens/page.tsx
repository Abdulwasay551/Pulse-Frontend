"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, KeyRound, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { createApiToken, listApiTokens, revokeApiToken, type ApiToken } from "@/lib/api-tokens-api";
import { ApiError } from "@/lib/auth-api";

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";

export default function ApiTokensPage() {
  const { withAuth } = useAuth();
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    try {
      setTokens(await withAuth((token) => listApiTokens(token)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const created = await withAuth((token) => createApiToken(token, label));
      setNewToken(created.token);
      setLabel("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(t: ApiToken) {
    if (!confirm(`Revoke "${t.label || "this token"}"? Anything using it will stop working immediately.`)) return;
    await withAuth((token) => revokeApiToken(token, t.id));
    await load();
  }

  function copyToken() {
    if (!newToken) return;
    navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/settings"
        className="mb-4 flex items-center gap-1.5 text-xs font-semibold text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Settings
      </Link>

      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">API Access</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Generate a personal access token to call Pulse&apos;s API directly (scripts, Postman, or the{" "}
          <a href="/api-docs" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">
            API documentation
          </a>
          ). A token only ever does what you can already do signed in — it carries your own role and permissions,
          nothing more.
        </p>
      </div>

      {newToken && (
        <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <div className="mb-2 text-sm font-semibold text-ink">Copy this token now — it won&apos;t be shown again</div>
          <div className="flex items-center gap-2 rounded-lg border border-line bg-cream px-3.5 py-2.5">
            <code className="flex-1 overflow-x-auto text-xs whitespace-nowrap text-ink">{newToken}</code>
            <button
              type="button"
              onClick={copyToken}
              className="shrink-0 rounded p-1 text-ink-soft hover:bg-cream-dim hover:text-ink"
              aria-label="Copy token"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-6 flex items-end gap-2 rounded-2xl border border-line bg-card p-5">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs uppercase tracking-wide text-ink-soft">Label (optional)</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={`e.g. "Local script"`}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
        >
          <KeyRound className="h-3.5 w-3.5" /> {creating ? "Generating…" : "Generate token"}
        </button>
      </form>
      {error && (
        <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : tokens.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
          No API tokens yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tokens.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card p-4">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-ink">{t.label || "Untitled token"}</div>
                <div className="text-xs text-ink-soft">
                  {t.prefix}…{t.revoked_at ? " · revoked" : ""}
                  {t.last_used_at ? ` · last used ${new Date(t.last_used_at).toLocaleDateString()}` : " · never used"}
                </div>
              </div>
              {!t.revoked_at && (
                <button
                  onClick={() => handleRevoke(t)}
                  aria-label={`Revoke ${t.label || "token"}`}
                  className="shrink-0 rounded-lg p-1.5 text-ink-soft hover:bg-maroon-soft hover:text-maroon"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
