import { apiFetch } from "./auth-api";
import { resourceApi } from "./api-resource";

export type AIProvider = "openai" | "anthropic" | "google" | "openrouter" | "deepseek" | "openai_compatible";

export interface AICredential {
  id: number;
  provider: AIProvider;
  label: string;
  base_url: string;
  model: string;
  key_last4: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AICredentialWrite {
  provider: AIProvider;
  label?: string;
  base_url?: string;
  model: string;
  api_key?: string;
}

export const aiCredentialsApi = resourceApi<AICredential, AICredentialWrite>("/ai/credentials/");

export function setDefaultAiCredential(token: string, id: number) {
  return apiFetch<AICredential>(`/ai/credentials/${id}/set-default/`, { method: "POST" }, token);
}

export function testAiCredential(token: string, id: number) {
  return apiFetch<{ ok: boolean; detail: string }>(`/ai/credentials/${id}/test/`, { method: "POST" }, token);
}

export interface AIProviderCatalogEntry {
  label: string;
  requires_base_url: boolean;
  suggested_models: string[];
}

export function getAiProviderCatalog(token: string) {
  return apiFetch<Record<AIProvider, AIProviderCatalogEntry>>("/ai/providers/", { method: "GET" }, token);
}

export interface AIFeatureSetting {
  feature_key: string;
  label: string;
  module: string;
  override_credential: number | null;
  effective_credential: { id: number; provider: AIProvider; model: string } | null;
  ai_enabled: boolean;
}

export function getAiFeatureSettings(token: string) {
  return apiFetch<AIFeatureSetting[]>("/ai/feature-settings/", { method: "GET" }, token);
}

export function setAiFeatureOverride(token: string, featureKey: string, credential: number | null) {
  return apiFetch<AIFeatureSetting>(
    `/ai/feature-settings/${featureKey}/`,
    { method: "PUT", body: JSON.stringify({ credential }) },
    token
  );
}

export interface AIStatus {
  has_default: boolean;
  features: Record<string, boolean>;
}

export function getAiStatus(token: string) {
  return apiFetch<AIStatus>("/ai/status/", { method: "GET" }, token);
}
