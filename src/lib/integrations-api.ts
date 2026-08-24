import { apiFetch } from "./auth-api";
import { resourceApi } from "./api-resource";

export type IntegrationKey = "slack" | "teams" | "webhook" | "twilio" | "zoom" | "checkr" | "dropbox_sign";

export interface IntegrationField {
  name: string;
  label: string;
  type: "text" | "url" | "password";
  secret: boolean;
  required: boolean;
  placeholder?: string;
}

export interface IntegrationCatalogEntry {
  label: string;
  category: string;
  description: string;
  setup_instructions: string;
  fields: IntegrationField[];
}

export type IntegrationCatalog = Record<IntegrationKey, IntegrationCatalogEntry>;

export interface IntegrationConnection {
  id: number;
  integration_key: IntegrationKey;
  label_display: string;
  label: string;
  masked_config: Record<string, string>;
  is_enabled: boolean;
  // Only set for integrations that report status back asynchronously
  // (Checkr, Dropbox Sign) — paste this into that third party's own
  // webhook/callback URL setting.
  webhook_receiver_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntegrationConnectionWrite {
  integration_key: IntegrationKey;
  label?: string;
  config: Record<string, string>;
  is_enabled?: boolean;
}

export const integrationConnectionsApi = resourceApi<IntegrationConnection, IntegrationConnectionWrite>(
  "/integrations/connections/"
);

export function getIntegrationCatalog(token: string) {
  return apiFetch<IntegrationCatalog>("/integrations/catalog/", { method: "GET" }, token);
}

export function testIntegrationConnection(token: string, id: number) {
  return apiFetch<{ ok: boolean; detail: string }>(`/integrations/connections/${id}/test/`, { method: "POST" }, token);
}
