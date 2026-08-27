"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Copy, KeyRound, Search } from "lucide-react";
import { getApiDirectory, type ApiDirectorySection } from "@/lib/api-directory-api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const METHOD_STYLE: Record<string, string> = {
  GET: "bg-primary/10 text-primary",
  POST: "bg-amber-soft text-amber",
  PATCH: "bg-primary-light/20 text-primary-dark",
  PUT: "bg-primary-light/20 text-primary-dark",
  DELETE: "bg-maroon-soft text-maroon",
};

export default function ApiDocsPage() {
  const [sections, setSections] = useState<ApiDirectorySection[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [token, setToken] = useState("");
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  useEffect(() => {
    getApiDirectory()
      .then((d) => setSections(d.sections))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load the API directory."));
  }, []);

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  const filtered = useMemo(() => {
    if (!sections) return [];
    return sections
      .map((s) => ({
        ...s,
        endpoints: s.endpoints.filter(
          (e) => !isSearching || e.path.toLowerCase().includes(q) || (e.name ?? "").toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.endpoints.length > 0);
  }, [sections, q, isSearching]);

  function curlFor(method: string, path: string) {
    const auth = token ? ` \\\n  -H "Authorization: Bearer ${token}"` : ` \\\n  -H "Authorization: Bearer <your-token>"`;
    const body = ["POST", "PATCH", "PUT"].includes(method) ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '{}'` : "";
    return `curl -X ${method} "${API_BASE}${path}"${auth}${body}`;
  }

  function copy(path: string, method: string) {
    navigator.clipboard.writeText(curlFor(method, path));
    setCopiedPath(path + method);
    setTimeout(() => setCopiedPath(null), 1500);
  }

  return (
    <div className="min-h-full bg-cream px-6 py-10 text-ink">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-ink">Pulse API directory</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every REST endpoint Pulse exposes, generated directly from the live URL configuration — this page is a dev
          reference only, not linked from anywhere in the product.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Base URL: <code className="rounded bg-cream-dim px-1.5 py-0.5">{API_BASE}</code> · Authenticate with{" "}
          <code className="rounded bg-cream-dim px-1.5 py-0.5">Authorization: Bearer &lt;token&gt;</code> — generate a
          personal token under Settings → API Access. A token only ever does what its owner can already do signed in.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2.5">
          <KeyRound className="h-4 w-4 shrink-0 text-ink-soft" />
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your API token here to fill it into the example commands below (kept in this browser tab only)"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none"
          />
        </div>

        <div className="mt-3 mb-6 flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-ink-soft" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search endpoints — path or name…"
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-maroon/30 bg-maroon-soft p-6 text-sm text-maroon">{error}</div>
        )}

        {!error && !sections && (
          <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
        )}

        {sections &&
          filtered.map((section) => {
            const isOpen = isSearching || !collapsed[section.label];
            return (
              <div key={section.label} className="mb-4 overflow-hidden rounded-2xl border border-line bg-card">
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => ({ ...c, [section.label]: !c[section.label] }))}
                  disabled={isSearching}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-cream/60 disabled:cursor-default disabled:hover:bg-transparent"
                >
                  <div className="flex items-center gap-2.5">
                    <h2 className="font-display text-sm font-bold text-ink">{section.label}</h2>
                    <span className="rounded-full bg-cream-dim px-2 py-0.5 text-[10.5px] font-semibold text-ink-soft">
                      {section.endpoints.length}
                    </span>
                  </div>
                  {!isSearching && (
                    <ChevronDown className={`h-4 w-4 shrink-0 text-ink-soft transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  )}
                </button>
                {isOpen && (
                  <div className="divide-y divide-line border-t border-line">
                    {section.endpoints.map((e) =>
                      e.methods.map((m) => (
                        <div key={e.path + m} className="flex flex-wrap items-center gap-3 px-5 py-3">
                          <span className={`w-16 shrink-0 rounded-md px-2 py-1 text-center text-[10.5px] font-bold ${METHOD_STYLE[m] ?? "bg-cream-dim text-ink-soft"}`}>
                            {m}
                          </span>
                          <code className="min-w-0 flex-1 truncate text-xs text-ink">{e.path}</code>
                          {e.name && <span className="hidden shrink-0 text-[11px] text-ink-soft sm:inline">{e.name}</span>}
                          <button
                            type="button"
                            onClick={() => copy(e.path, m)}
                            aria-label="Copy curl command"
                            className="shrink-0 rounded p-1 text-ink-soft hover:bg-cream-dim hover:text-ink"
                          >
                            {copiedPath === e.path + m ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}

        {sections && isSearching && filtered.length === 0 && (
          <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">
            No endpoints match &quot;{query}&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
