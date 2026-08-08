import { apiFetch } from "./auth-api";
import { csvApi, resourceApi } from "./api-resource";
import type { EmployeeLite } from "./people-api";

export type AssetCategory = "Laptop" | "Monitor" | "Phone" | "Tablet" | "Peripheral" | "Other";
export type AssetStatus = "In Stock" | "Assigned" | "In Repair" | "Retired";
export type WarrantyStatus = "Active" | "Expiring Soon" | "Expired" | "Unknown";

export interface Asset {
  id: number;
  asset_tag: string;
  name: string;
  category: AssetCategory;
  serial_number: string;
  purchase_date: string | null;
  warranty_expiry: string | null;
  status: AssetStatus;
  assigned_to: number | null;
  assigned_to_detail: EmployeeLite | null;
  assigned_at: string | null;
  is_byod: boolean;
  notes: string;
  warranty_status: WarrantyStatus;
  open_ticket_count: number;
  created_at: string;
  updated_at: string;
}

export interface AssetWrite {
  asset_tag: string;
  name: string;
  category?: AssetCategory;
  serial_number?: string;
  purchase_date?: string | null;
  warranty_expiry?: string | null;
  status?: AssetStatus;
  assigned_to?: number | null;
  assigned_at?: string | null;
  is_byod?: boolean;
  notes?: string;
}

export const assetsApi = resourceApi<Asset, AssetWrite>("/it-assets/assets/");
export const assetsCsv = csvApi("/it-assets/assets/", "assets.csv");

export type TicketCategory = "Repair Request" | "Device Query" | "Access Request" | "Other";
export type TicketPriority = "Low" | "Medium" | "High";
export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

export interface SupportTicket {
  id: number;
  asset: number | null;
  asset_tag: string;
  employee: number;
  employee_detail: EmployeeLite;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  resolved_at: string | null;
}

export interface SupportTicketWrite {
  asset?: number | null;
  employee: number;
  subject: string;
  description?: string;
  category?: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
}

export const supportTicketsApi = resourceApi<SupportTicket, SupportTicketWrite>("/it-assets/support-tickets/");
export const supportTicketsCsv = csvApi("/it-assets/support-tickets/", "support-tickets.csv");

export type IncidentType = "Damage" | "Repair" | "Loss" | "Malfunction" | "Other";

export interface AssetIncident {
  id: number;
  asset: number;
  asset_tag: string;
  asset_name: string;
  employee: number | null;
  employee_detail: EmployeeLite | null;
  incident_type: IncidentType;
  description: string;
  incident_date: string;
  resolved: boolean;
  resolution_notes: string;
  cost: string;
  created_at: string;
}

export interface AssetIncidentWrite {
  asset: number;
  employee?: number | null;
  incident_type?: IncidentType;
  description?: string;
  incident_date?: string;
  resolved?: boolean;
  resolution_notes?: string;
  cost?: number | string;
}

export const assetIncidentsApi = resourceApi<AssetIncident, AssetIncidentWrite>("/it-assets/asset-incidents/");
export const assetIncidentsCsv = csvApi("/it-assets/asset-incidents/", "device-incidents.csv");

export type BYODComplianceStatus = "Compliant" | "Non-Compliant" | "Pending Review";

export interface BYODCompliance {
  id: number;
  asset: number;
  asset_tag: string;
  employee: number;
  employee_detail: EmployeeLite;
  encryption_enabled: boolean;
  antivirus_installed: boolean;
  passcode_enabled: boolean;
  compliance_status: BYODComplianceStatus;
  last_checked: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BYODComplianceWrite {
  asset: number;
  employee: number;
  encryption_enabled?: boolean;
  antivirus_installed?: boolean;
  passcode_enabled?: boolean;
  compliance_status?: BYODComplianceStatus;
  last_checked?: string | null;
  notes?: string;
}

export const byodComplianceApi = resourceApi<BYODCompliance, BYODComplianceWrite>("/it-assets/byod-checks/");
export const byodComplianceCsv = csvApi("/it-assets/byod-checks/", "byod-compliance.csv");

export interface ItAssetsDashboardSummary {
  overview_stats: { label: string; value: string; change: string; href: string }[];
  kpis: { label: string; value: string; href: string }[];
}

export function getItAssetsDashboardSummary(token: string) {
  return apiFetch<ItAssetsDashboardSummary>("/it-assets/dashboard-summary/", { method: "GET" }, token);
}
