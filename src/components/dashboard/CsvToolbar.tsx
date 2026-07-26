"use client";

import { useState } from "react";
import { Download, Upload } from "lucide-react";
import Modal from "./Modal";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/auth-api";
import type { ImportPreview, ImportResult } from "@/lib/api-resource";

interface CsvIO {
  exportCsv: (token: string) => Promise<void>;
  importPreview: (token: string, file: File) => Promise<ImportPreview>;
  importCommit: (
    token: string,
    payload: { columns: string[]; rows: string[][]; mapping: Record<string, string> }
  ) => Promise<ImportResult>;
}

const buttonClass =
  "flex items-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2.5 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink disabled:opacity-60";
const inputClass =
  "w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none";

/** Export/Import CSV buttons for a resource, plus the column-mapping import
 * wizard modal. Shared across Recruit resources (Clients, Candidates) —
 * same two-step preview→commit plumbing regardless of which fields the
 * resource has. */
export default function CsvToolbar({
  csv,
  resourceLabel,
  requiredFields,
  onImported,
}: {
  csv: CsvIO;
  resourceLabel: string;
  /** Field keys (from the preview response's `fields` map) that must be
   * mapped before committing — mirrors the backend's *_REQUIRED_FIELDS. */
  requiredFields: string[];
  onImported: () => void;
}) {
  const { withAuth } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      await withAuth((token) => csv.exportCsv(token));
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button onClick={handleExport} disabled={exporting} className={buttonClass}>
          <Download className="h-4 w-4" /> {exporting ? "Exporting…" : "Export CSV"}
        </button>
        <button onClick={() => setWizardOpen(true)} className={buttonClass}>
          <Upload className="h-4 w-4" /> Import CSV
        </button>
      </div>

      {wizardOpen && (
        <ImportWizard
          csv={csv}
          resourceLabel={resourceLabel}
          requiredFields={requiredFields}
          onClose={() => setWizardOpen(false)}
          onImported={onImported}
        />
      )}
    </>
  );
}

type Step = "upload" | "mapping" | "result";

function ImportWizard({
  csv,
  resourceLabel,
  requiredFields,
  onClose,
  onImported,
}: {
  csv: CsvIO;
  resourceLabel: string;
  requiredFields: string[];
  onClose: () => void;
  onImported: () => void;
}) {
  const { withAuth } = useAuth();
  const [step, setStep] = useState<Step>("upload");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setBusy(true);
    try {
      const data = await withAuth((token) => csv.importPreview(token, file));
      setPreview(data);
      setMapping(data.suggested_mapping);
      setStep("mapping");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't read that file. Please try a different CSV.");
    } finally {
      setBusy(false);
    }
  }

  function mappedFieldKeys() {
    return new Set(Object.values(mapping).filter(Boolean));
  }

  async function handleCommit() {
    if (!preview) return;
    const mappedKeys = mappedFieldKeys();
    const missing = requiredFields.filter((f) => !mappedKeys.has(f));
    if (missing.length > 0) {
      setError(`Map a column to the required field(s): ${missing.map((f) => preview.fields[f] ?? f).join(", ")}.`);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const res = await withAuth((token) =>
        csv.importCommit(token, { columns: preview.columns, rows: preview.rows, mapping })
      );
      setResult(res);
      setStep("result");
      if (res.created > 0) onImported();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Import failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={`Import ${resourceLabel} from CSV`} onClose={onClose} wide>
      {error && (
        <div className="mb-4 rounded-lg border border-maroon/30 bg-maroon-soft px-3.5 py-2.5 text-sm text-maroon">
          {error}
        </div>
      )}

      {step === "upload" && (
        <div>
          <p className="mb-4 text-sm text-ink-soft">
            Upload a CSV file. On the next step you&apos;ll map its columns to {resourceLabel} fields before anything
            is imported.
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-cream px-6 py-10 text-center transition-colors hover:border-primary/50">
            <Upload className="h-6 w-6 text-ink-soft" />
            <span className="text-sm font-semibold text-ink">
              {busy ? "Reading file…" : "Choose a CSV file"}
            </span>
            <span className="text-xs text-ink-soft">.csv, up to 5,000 rows</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      )}

      {step === "mapping" && preview && (
        <div>
          <p className="mb-4 text-sm text-ink-soft">
            {preview.row_count} row{preview.row_count === 1 ? "" : "s"} found. Match each CSV column to a field —
            unmapped columns are ignored.
          </p>
          <div className="mb-5 max-h-72 overflow-y-auto rounded-lg border border-line">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-cream-dim">
                <tr className="text-[11px] uppercase tracking-wide text-ink-soft">
                  <th className="px-3.5 py-2.5 font-medium">CSV column</th>
                  <th className="px-3.5 py-2.5 font-medium">Sample</th>
                  <th className="px-3.5 py-2.5 font-medium">Maps to</th>
                </tr>
              </thead>
              <tbody>
                {preview.columns.map((col, i) => (
                  <tr key={col} className="border-t border-line">
                    <td className="px-3.5 py-2.5 font-semibold text-ink">{col}</td>
                    <td className="max-w-[140px] truncate px-3.5 py-2.5 text-xs text-ink-soft">
                      {preview.rows[0]?.[i] ?? "—"}
                    </td>
                    <td className="px-3.5 py-2.5">
                      <select
                        value={mapping[col] ?? ""}
                        onChange={(e) => setMapping({ ...mapping, [col]: e.target.value })}
                        className={inputClass}
                      >
                        <option value="">Don&apos;t import</option>
                        {Object.entries(preview.fields).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                            {requiredFields.includes(key) ? " *" : ""}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setStep("upload");
                setPreview(null);
                setError(null);
              }}
              className="text-xs font-semibold text-ink-soft hover:text-ink"
            >
              ← Choose a different file
            </button>
            <button
              onClick={handleCommit}
              disabled={busy}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {busy ? "Importing…" : `Import ${preview.row_count} row${preview.row_count === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div>
          <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 px-3.5 py-2.5 text-sm text-primary">
            {result.created} {resourceLabel} imported successfully.
          </div>
          {result.errors.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-maroon">
                {result.errors.length} row{result.errors.length === 1 ? "" : "s"} skipped
              </h3>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-maroon/30 bg-maroon-soft p-3">
                <ul className="space-y-1 text-xs text-maroon">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            Done
          </button>
        </div>
      )}
    </Modal>
  );
}
