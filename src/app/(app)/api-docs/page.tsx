"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Copy, KeyRound, Lock, Search, Unlock } from "lucide-react";
import { getApiDirectory, type ApiDirectorySection, type ApiEndpoint } from "@/lib/api-directory-api";

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
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
          (e) =>
            !isSearching ||
            e.path.toLowerCase().includes(q) ||
            (e.name ?? "").toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.endpoints.length > 0);
  }, [sections, q, isSearching]);

  const totalEndpointCalls = useMemo(
    () => (sections ?? []).reduce((sum, s) => sum + s.endpoints.reduce((n, e) => n + e.methods.length, 0), 0),
    [sections]
  );

  function jumpTo(label: string) {
    setCollapsed((c) => ({ ...c, [label]: false }));
    setQuery("");
    requestAnimationFrame(() => sectionRefs.current[label]?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function curlFor(method: string, path: string) {
    const auth = ` \\\n  -H "Authorization: Bearer ${token || "<your-token>"}"`;
    const body = ["POST", "PATCH", "PUT"].includes(method) ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '{}'` : "";
    return `curl -X ${method} "${API_BASE}${path}"${auth}${body}`;
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }

  function rowKey(e: ApiEndpoint, m: string) {
    return e.path + m;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-cream text-ink">
      <nav className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-cream/10 bg-primary-dark py-5 lg:flex">
        <div className="px-4 pb-1 text-[11px] font-semibold tracking-wide text-cream/40 uppercase">API Directory</div>
        <div className="px-4 pb-3 text-[10.5px] text-cream/40">{totalEndpointCalls} endpoints</div>
        <div className="flex flex-col gap-0.5 px-3">
          {(sections ?? []).map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => jumpTo(s.label)}
              className="flex items-center justify-between gap-2 rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold text-cream/60 transition-colors hover:bg-cream/5 hover:text-cream"
            >
              <span className="truncate">{s.label}</span>
              <span className="shrink-0 text-[10.5px] text-cream/40">{s.endpoints.length}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="min-w-0 flex-1 overflow-y-auto px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-ink">Pulse API directory</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every REST endpoint Pulse exposes, generated directly from the live URL configuration and each view&apos;s
          own docstring — this page is a dev reference only, not linked from anywhere in the product.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          Base URL: <code className="rounded bg-cream-dim px-1.5 py-0.5">{API_BASE}</code> · Authenticate with{" "}
          <code className="rounded bg-cream-dim px-1.5 py-0.5">Authorization: Bearer &lt;token&gt;</code> — generate a
          personal token under Settings → API Access. A token only ever does what its owner can already do signed in.
        </p>

        <div className="mt-6 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
          {(sections ?? []).map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => jumpTo(s.label)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-ink-soft hover:bg-cream-dim hover:text-ink"
            >
              {s.label} <span className="text-ink-soft/70">{s.endpoints.length}</span>
            </button>
          ))}
        </div>

        <div className="mt-4">
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2.5">
              <KeyRound className="h-4 w-4 shrink-0 text-ink-soft" />
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your API token to fill it into the example commands below (kept in this browser tab only)"
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-soft/70 focus:outline-none"
              />
            </div>

            <div className="mb-6 flex items-center gap-2 rounded-xl border border-line bg-card px-3.5 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-ink-soft" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search endpoints — path, name, or description…"
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
                  <div
                    key={section.label}
                    ref={(el) => { sectionRefs.current[section.label] = el; }}
                    className="mb-4 scroll-mt-6 overflow-hidden rounded-2xl border border-line bg-card"
                  >
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
                          e.methods.map((m) => {
                            const key = rowKey(e, m);
                            const isExpanded = expanded === key;
                            return (
                              <div key={key}>
                                <button
                                  type="button"
                                  onClick={() => setExpanded(isExpanded ? null : key)}
                                  className="flex w-full flex-wrap items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-cream/40"
                                >
                                  <span className={`w-16 shrink-0 rounded-md px-2 py-1 text-center text-[10.5px] font-bold ${METHOD_STYLE[m] ?? "bg-cream-dim text-ink-soft"}`}>
                                    {m}
                                  </span>
                                  <code className="min-w-0 flex-1 truncate text-xs text-ink">{e.path}</code>
                                  {e.auth_required ? (
                                    <Lock className="h-3 w-3 shrink-0 text-ink-soft" aria-label="Requires authentication" />
                                  ) : (
                                    <Unlock className="h-3 w-3 shrink-0 text-primary" aria-label="Public, no authentication" />
                                  )}
                                  <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-ink-soft transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                </button>
                                {isExpanded && (
                                  <div className="border-t border-line bg-cream/40 px-5 py-4">
                                    {e.description && <p className="mb-3 text-xs text-ink-soft">{e.description}</p>}
                                    <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-ink-soft">
                                      {e.name && (
                                        <span>
                                          Name: <code className="text-ink">{e.name}</code>
                                        </span>
                                      )}
                                      <span>{e.auth_required ? "Requires a Bearer token" : "No authentication required"}</span>
                                    </div>
                                    <div className="flex items-start gap-2 rounded-lg border border-line bg-cream px-3 py-2.5">
                                      <pre className="min-w-0 flex-1 overflow-x-auto text-[11px] whitespace-pre text-ink">{curlFor(m, e.path)}</pre>
                                      <button
                                        type="button"
                                        onClick={() => copy(curlFor(m, e.path), key)}
                                        aria-label="Copy curl command"
                                        className="shrink-0 rounded p-1 text-ink-soft hover:bg-cream-dim hover:text-ink"
                                      >
                                        {copiedKey === key ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
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
      </div>
    </div>
  );
}
