import { apiFetch } from "./auth-api";

export type ClientStatus = "Active" | "Prospect" | "At risk";

export interface Client {
  id: number;
  name: string;
  industry: string;
  contact_name: string;
  contact_email: string;
  status: ClientStatus;
  open_roles: number;
  created_at: string;
  updated_at: string;
}

export type RequisitionPriority = "High" | "Medium" | "Low";
export type RequisitionStatus = "Open" | "Interviewing" | "Offer stage" | "On hold" | "Filled";

export interface Requisition {
  id: number;
  client: number;
  client_name: string;
  title: string;
  recruiter: string;
  priority: RequisitionPriority;
  status: RequisitionStatus;
  posted_at: string;
  candidates_count: number;
  created_at: string;
  updated_at: string;
}

export type CandidateStage = "Sourced" | "Interview" | "Offer" | "Placed" | "Rejected";
export type CandidateSource = "LinkedIn" | "Referral" | "Job Board" | "Sourced" | "Other";

export interface Candidate {
  id: number;
  name: string;
  initials: string;
  role: string;
  client: number | null;
  client_name: string | null;
  requisition: number | null;
  stage: CandidateStage;
  source: CandidateSource;
  applied_at: string;
  placed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type PayrollStatus = "Reconciled" | "Needs review" | "Processing";

export interface PayrollRun {
  id: number;
  period: string;
  contractors: number;
  amount: string;
  status: PayrollStatus;
  created_at: string;
  updated_at: string;
}

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
  tone: "primary" | "amber" | "maroon" | "neutral";
}

export interface DashboardSummary {
  overview_stats: { label: string; value: string; change: string; href: string }[];
  pipeline_stages: { label: string; count: number }[];
  source_breakdown: { label: string; percent: number }[];
  placements_trend: { month: string; value: number }[];
  recent_activity: ActivityItem[];
}

function resourceApi<T, TWrite extends object = Partial<T>>(path: string) {
  return {
    list: (token: string) => apiFetch<T[]>(path, { method: "GET" }, token),
    create: (token: string, data: TWrite) =>
      apiFetch<T>(path, { method: "POST", body: JSON.stringify(data) }, token),
    update: (token: string, id: number, data: Partial<TWrite>) =>
      apiFetch<T>(`${path}${id}/`, { method: "PATCH", body: JSON.stringify(data) }, token),
    remove: (token: string, id: number) => apiFetch<void>(`${path}${id}/`, { method: "DELETE" }, token),
  };
}

export interface ClientWrite {
  name: string;
  industry?: string;
  contact_name?: string;
  contact_email?: string;
  status?: ClientStatus;
}

export interface RequisitionWrite {
  client: number;
  title: string;
  recruiter?: string;
  priority?: RequisitionPriority;
  status?: RequisitionStatus;
}

export interface CandidateWrite {
  name: string;
  role: string;
  client?: number | null;
  requisition?: number | null;
  stage?: CandidateStage;
  source?: CandidateSource;
}

export interface PayrollRunWrite {
  period: string;
  contractors: number;
  amount: number | string;
  status?: PayrollStatus;
}

export const clientsApi = resourceApi<Client, ClientWrite>("/crm/clients/");
export const requisitionsApi = resourceApi<Requisition, RequisitionWrite>("/crm/requisitions/");
export const candidatesApi = resourceApi<Candidate, CandidateWrite>("/crm/candidates/");
export const payrollApi = resourceApi<PayrollRun, PayrollRunWrite>("/crm/payroll-runs/");

export function getDashboardSummary(token: string) {
  return apiFetch<DashboardSummary>("/crm/dashboard-summary/", { method: "GET" }, token);
}
