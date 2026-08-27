import { apiFetch } from "./auth-api";

export interface ApiToken {
  id: number;
  label: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface ApiTokenCreated extends ApiToken {
  // Only ever present in the create response — shown once, never again.
  token: string;
}

export function listApiTokens(token: string) {
  return apiFetch<ApiToken[]>("/api-tokens/", { method: "GET" }, token);
}

export function createApiToken(token: string, label: string) {
  return apiFetch<ApiTokenCreated>("/api-tokens/", { method: "POST", body: JSON.stringify({ label }) }, token);
}

export function revokeApiToken(token: string, id: number) {
  return apiFetch<ApiToken>(`/api-tokens/${id}/revoke/`, { method: "POST" }, token);
}
