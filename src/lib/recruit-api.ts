import { apiFetch } from "./auth-api";
import { resourceApi } from "./api-resource";

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

export const clientsApi = resourceApi<Client, ClientWrite>("/recruit/clients/");
export const requisitionsApi = resourceApi<Requisition, RequisitionWrite>("/recruit/requisitions/");
export const candidatesApi = resourceApi<Candidate, CandidateWrite>("/recruit/candidates/");

export function getDashboardSummary(token: string) {
  return apiFetch<DashboardSummary>("/recruit/dashboard-summary/", { method: "GET" }, token);
}
