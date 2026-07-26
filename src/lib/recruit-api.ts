import { apiFetch } from "./auth-api";
import { csvApi, resourceApi } from "./api-resource";

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
  requirements: string;
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
  email: string;
  phone: string;
  client: number | null;
  client_name: string | null;
  requisition: number | null;
  requisition_title: string | null;
  stage: CandidateStage;
  source: CandidateSource;
  applied_at: string;
  placed_at: string | null;
  resume_file: string | null;
  resume_text: string;
  ai_score: number | null;
  ai_score_notes: string;
  portal_token: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateLite {
  id: number;
  name: string;
  initials: string;
  role: string;
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
  requirements?: string;
}

export interface CandidateWrite {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  client?: number | null;
  requisition?: number | null;
  stage?: CandidateStage;
  source?: CandidateSource;
  applied_at?: string;
  resume_text?: string;
  resume_file?: string | null;
}

export const clientsApi = resourceApi<Client, ClientWrite>("/recruit/clients/");
export const requisitionsApi = resourceApi<Requisition, RequisitionWrite>("/recruit/requisitions/");
export const candidatesApi = resourceApi<Candidate, CandidateWrite>("/recruit/candidates/");
export const clientsCsv = csvApi("/recruit/clients/", "clients.csv");
export const candidatesCsv = csvApi("/recruit/candidates/", "candidates.csv");

export function getDashboardSummary(token: string) {
  return apiFetch<DashboardSummary>("/recruit/dashboard-summary/", { method: "GET" }, token);
}

export function screenCandidate(token: string, id: number) {
  return apiFetch<Candidate>(`/recruit/candidates/${id}/screen/`, { method: "POST" }, token);
}

export function uploadResume(token: string, id: number, file: File) {
  const formData = new FormData();
  formData.append("resume_file", file);
  return apiFetch<Candidate>(`/recruit/candidates/${id}/`, { method: "PATCH", body: formData }, token);
}

// --- Offer letters ---

export type OfferLetterStatus = "Draft" | "Sent" | "Signed" | "Declined";

export interface OfferLetter {
  id: number;
  candidate: number;
  candidate_detail: CandidateLite;
  job_title: string;
  salary: string | null;
  start_date: string | null;
  body: string;
  status: OfferLetterStatus;
  sent_at: string | null;
  signed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfferLetterWrite {
  candidate: number;
  job_title: string;
  salary?: number | string | null;
  start_date?: string | null;
  body: string;
  status?: OfferLetterStatus;
}

export const offerLettersApi = resourceApi<OfferLetter, OfferLetterWrite>("/recruit/offer-letters/");

// --- Background checks ---

export type BackgroundCheckType = "Criminal" | "Employment" | "Education" | "Credit" | "Reference";
export type BackgroundCheckStatus = "Pending" | "In Progress" | "Cleared" | "Flagged";

export interface BackgroundCheck {
  id: number;
  candidate: number;
  candidate_detail: CandidateLite;
  check_type: BackgroundCheckType;
  status: BackgroundCheckStatus;
  initiated_at: string | null;
  completed_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface BackgroundCheckWrite {
  candidate: number;
  check_type: BackgroundCheckType;
  status?: BackgroundCheckStatus;
  notes?: string;
}

export const backgroundChecksApi = resourceApi<BackgroundCheck, BackgroundCheckWrite>("/recruit/background-checks/");

// --- Onboarding ---

export type OnboardingStatus = "Not Started" | "In Progress" | "Completed";
export type OnboardingCategory =
  | "Pre-Joining Documents"
  | "Orientation"
  | "Training Plan"
  | "Portal Access"
  | "Probation Evaluation"
  | "Device Assignment";
export type TaskStatus = "Pending" | "In Progress" | "Done";

export interface OnboardingTask {
  id: number;
  onboarding: number;
  category: OnboardingCategory;
  title: string;
  status: TaskStatus;
  due_date: string | null;
  notes: string;
  created_at: string;
}

export interface OnboardingTaskWrite {
  onboarding: number;
  category: OnboardingCategory;
  title: string;
  status?: TaskStatus;
  due_date?: string | null;
  notes?: string;
}

export interface Onboarding {
  id: number;
  candidate: number;
  candidate_detail: CandidateLite;
  start_date: string;
  status: OnboardingStatus;
  tasks: OnboardingTask[];
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface OnboardingWrite {
  candidate: number;
  start_date: string;
  status?: OnboardingStatus;
}

export const onboardingsApi = resourceApi<Onboarding, OnboardingWrite>("/recruit/onboardings/");
export const onboardingTasksApi = resourceApi<OnboardingTask, OnboardingTaskWrite>("/recruit/onboarding-tasks/");

// --- Offboarding ---

export type OffboardingStatus = "Not Started" | "In Progress" | "Completed";
export type OffboardingCategory = "Documents Checklist" | "Access Status" | "Hardware Clearance";

export interface OffboardingTask {
  id: number;
  offboarding: number;
  category: OffboardingCategory;
  title: string;
  status: TaskStatus;
  due_date: string | null;
  notes: string;
  created_at: string;
}

export interface OffboardingTaskWrite {
  offboarding: number;
  category: OffboardingCategory;
  title: string;
  status?: TaskStatus;
  due_date?: string | null;
  notes?: string;
}

export interface Offboarding {
  id: number;
  candidate: number;
  candidate_detail: CandidateLite;
  last_working_day: string;
  reason: string;
  rehire_eligible: boolean;
  rehire_notes: string;
  status: OffboardingStatus;
  tasks: OffboardingTask[];
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface OffboardingWrite {
  candidate: number;
  last_working_day: string;
  reason?: string;
  rehire_eligible?: boolean;
  rehire_notes?: string;
  status?: OffboardingStatus;
}

export const offboardingsApi = resourceApi<Offboarding, OffboardingWrite>("/recruit/offboardings/");
export const offboardingTasksApi = resourceApi<OffboardingTask, OffboardingTaskWrite>("/recruit/offboarding-tasks/");
