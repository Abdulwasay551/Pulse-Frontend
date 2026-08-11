"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Upload } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import Modal from "@/components/dashboard/Modal";
import AssetLink from "@/components/dashboard/AssetLink";
import EmployeeLink from "@/components/dashboard/EmployeeLink";
import { useAuth } from "@/lib/auth-context";
import { assetsApi, updateWarrantyDetails, type Asset, type WarrantyStatus } from "@/lib/it-assets-api";
import { ApiError } from "@/lib/auth-api";

const warrantyTone: Record<WarrantyStatus, string> = {
  Active: "bg-primary/15 text-primary",
  "Expiring Soon": "bg-amber-soft text-amber",
  Expired: "bg-maroon-soft text-maroon",
  Unknown: "bg-cream-dim text-ink-soft",
};

const timelineTone: Record<WarrantyStatus, string> = {
  Active: "bg-primary",
  "Expiring Soon": "bg-amber",
  Expired: "bg-maroon",
  Unknown: "bg-ink-soft/40",
};

const filterOptions: (WarrantyStatus | "All")[] = ["All", "Active", "Expiring Soon", "Expired", "Unknown"];

const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3.5 py-2.5 text-sm text-ink focus:border-primary focus:outline-none";
const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-ink-soft";

/** How far along an asset is between purchase and warranty expiry, for the
 * timeline bar — 0 at purchase, 100 at (or past) expiry. Assets missing
 * either date just render a flat "not enough data" bar. */
function warrantyProgress(asset: Asset): number | null {
  if (!asset.purchase_date || !asset.warranty_expiry) return null;
  const purchase = new Date(asset.purchase_date).getTime();
  const expiry = new Date(asset.warranty_expiry).getTime();
  if (expiry <= purchase) return 100;
  const today = Date.now();
  const pct = ((today - purchase) / (expiry - purchase)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export default function WarrantyTrackingPage() {
  const { withAuth } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WarrantyStatus | "All">("All");
  const [editing, setEditing] = useState<Asset | null>(null);

  async function load() {
    try {
      const a = await withAuth((token) => assetsApi.list(token));
      setAssets(a);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = useMemo(() => {
    const result: Record<WarrantyStatus, number> = { Active: 0, "Expiring Soon": 0, Expired: 0, Unknown: 0 };
    for (const a of assets) result[a.warranty_status] += 1;
    return result;
  }, [assets]);

  const filtered = filter === "All" ? assets : assets.filter((a) => a.warranty_status === filter);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Warranty Tracking</h1>
        <p className="mt-1 text-sm text-ink-soft">Know what&apos;s covered, and until when.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Active warranties" value={String(counts.Active)} />
        <StatCard label="Expiring soon (60 days)" value={String(counts["Expiring Soon"])} />
        <StatCard label="Expired" value={String(counts.Expired)} valueTone={counts.Expired > 0 ? "maroon" : "ink"} />
      </div>

      <div className="mb-4 flex gap-2">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              filter === f ? "bg-primary text-cream" : "bg-cream-dim text-ink-soft hover:text-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-card p-10 text-center text-sm text-ink-soft">No assets match this filter.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const progress = warrantyProgress(a);
            return (
              <div key={a.id} className="rounded-2xl border border-line bg-card p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <AssetLink asset={a} />
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold whitespace-nowrap ${warrantyTone[a.warranty_status]}`}>
                    {a.warranty_status}
                  </span>
                </div>
                <div className="mb-3 text-xs text-ink-soft">
                  {a.assigned_to_detail ? <EmployeeLink employee={a.assigned_to_detail} /> : "Unassigned"}
                </div>

                <div className="mb-1 flex justify-between text-[11px] text-ink-soft">
                  <span>{a.purchase_date ?? "Purchase date unknown"}</span>
                  <span>{a.warranty_expiry ?? "Expiry unknown"}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-cream-dim">
                  <div
                    className={`h-full rounded-full ${timelineTone[a.warranty_status]}`}
                    style={{ width: `${progress ?? 0}%` }}
                  />
                </div>

                {(a.warranty_provider || a.warranty_notes) && (
                  <p className="mt-3 truncate text-xs text-ink-soft">
                    {a.warranty_provider && <span className="font-semibold text-ink">{a.warranty_provider}</span>}
                    {a.warranty_provider && a.warranty_notes && " — "}
                    {a.warranty_notes}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between gap-2">
                  {a.warranty_document ? (
                    <a
                      href={a.warranty_document}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark"
                    >
                      <FileText className="h-3.5 w-3.5" /> View document
                    </a>
                  ) : (
                    <span className="text-xs text-ink-soft">No document logged</span>
                  )}
                  <button
                    onClick={() => setEditing(a)}
                    className="text-xs font-semibold text-primary hover:text-primary-dark"
                  >
                    Log details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <WarrantyDetailsModal
          asset={editing}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function WarrantyDetailsModal({ asset, onClose, onSaved }: { asset: Asset; onClose: () => void; onSaved: () => Promise<void> }) {
  const { withAuth } = useAuth();
  const [expiry, setExpiry] = useState(asset.warranty_expiry ?? "");
  const [provider, setProvider] = useState(asset.warranty_provider);
  const [notes, setNotes] = useState(asset.warranty_notes);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await withAuth((token) =>
        updateWarrantyDetails(token, asset.id, {
          warranty_expiry: expiry,
          warranty_provider: provider,
          warranty_notes: notes,
          document: file,
        })
      );
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save warranty details. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Warranty details · ${asset.name}`} onClose={onClose}>
      {error && (
        <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">{error}</div>
      )}
      <div className="mb-4">
        <label className={labelClass}>Warranty expiry</label>
        <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className={inputClass} />
      </div>
      <div className="mb-4">
        <label className={labelClass}>Provider</label>
        <input
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder="e.g. AppleCare, Dell ProSupport"
          className={inputClass}
        />
      </div>
      <div className="mb-4">
        <label className={labelClass}>Notes</label>
        <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
      </div>
      <div className="mb-6">
        <label className={labelClass}>Warranty document</label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-line bg-cream px-3.5 py-2.5 text-xs font-semibold text-ink-soft hover:bg-cream-dim">
          <Upload className="h-3.5 w-3.5" /> {file ? file.name : asset.warranty_document ? "Replace file" : "Choose file"}
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save warranty details"}
      </button>
    </Modal>
  );
}
