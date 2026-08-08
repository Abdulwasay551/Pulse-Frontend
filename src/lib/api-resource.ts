import { apiFetch, downloadFile } from "./auth-api";

// Generic list/create/update/remove factory shared by every module's API
// client (recruit-api.ts, payroll-benefits-api.ts, and whichever come next)
// — the plumbing is identical across modules even though the domain
// types/endpoints are deliberately kept in separate, independent files.
export function resourceApi<T, TWrite extends object = Partial<T>>(path: string) {
  return {
    list: (token: string) => apiFetch<T[]>(path, { method: "GET" }, token),
    create: (token: string, data: TWrite) =>
      apiFetch<T>(path, { method: "POST", body: JSON.stringify(data) }, token),
    update: (token: string, id: number, data: Partial<TWrite>) =>
      apiFetch<T>(`${path}${id}/`, { method: "PATCH", body: JSON.stringify(data) }, token),
    remove: (token: string, id: number) => apiFetch<void>(`${path}${id}/`, { method: "DELETE" }, token),
  };
}

export interface ImportPreview {
  columns: string[];
  rows: string[][];
  row_count: number;
  suggested_mapping: Record<string, string>;
  fields: Record<string, string>;
}

export interface ImportResult {
  created: number;
  errors: string[];
}

// CSV import/export factory — a two-step import (preview the parsed CSV +
// suggested column mapping, then commit once the user confirms/adjusts the
// mapping) plus a one-shot authenticated export download. Shared the same
// way resourceApi is: identical plumbing, reused across whichever
// resources in whichever module need bulk CSV in/out.
export function csvApi(path: string, exportFilename: string) {
  const templateFilename = exportFilename.replace(/\.csv$/, "-import-template.csv");
  return {
    exportCsv: (token: string) => downloadFile(`${path}export/`, token, exportFilename),
    // A blank CSV with just the header row, so the expected columns are
    // visible before uploading a real file — separate from exportCsv,
    // which dumps actual data.
    downloadTemplate: (token: string) => downloadFile(`${path}import/template/`, token, templateFilename),
    importPreview: (token: string, file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiFetch<ImportPreview>(`${path}import/preview/`, { method: "POST", body: formData }, token);
    },
    importCommit: (token: string, payload: { columns: string[]; rows: string[][]; mapping: Record<string, string> }) =>
      apiFetch<ImportResult>(`${path}import/commit/`, { method: "POST", body: JSON.stringify(payload) }, token),
  };
}
