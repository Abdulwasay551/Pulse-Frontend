import { apiFetch } from "./auth-api";

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
