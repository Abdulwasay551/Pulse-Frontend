import { apiFetch } from "./auth-api";
import type { UserRole } from "./auth-api";
import type { OnboardingTask } from "./recruit-api";
import type { Appraisal, CompetencyRating, Goal } from "./talent-api";
import type { BenefitClaim, BenefitClaimWrite } from "./payroll-benefits-api";
import type { SupportTicket, SupportTicketWrite } from "./it-assets-api";

// --- HR: employee/staff account provisioning ---

export function sendEmployeeInvite(token: string, data: { employee: number; email: string }) {
  return apiFetch<{ detail: string; signup_link: string }>(
    "/employee-invites/",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

// role/department are optional — omit for a plain Employee account (the
// original behavior). "Department Head" requires department; "Recruiter"
// and "Employee" are the only other values HR is allowed to create here
// (IT Manager/Finance Admin are Admin/Django-admin-only).
export function createEmployeeAccount(
  token: string,
  data: { employee: number; username: string; password: string; role?: UserRole; department?: string }
) {
  return apiFetch<{ detail: string; username: string; role: UserRole }>(
    "/employee-accounts/",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

// --- Employee self-service ---

export interface MyDashboard {
  employee: { id: number; name: string; initials: string; job_title: string; department: string };
  attendance_today: { clock_in: string | null; clock_out: string | null } | null;
  goals: {
    id: number;
    title: string;
    status: "Not Started" | "In Progress" | "Completed";
    progress: number;
    target_date: string | null;
  }[];
  recent_activity: { id: string; message: string; time: string; tone: "primary" | "amber" | "maroon" | "neutral" }[];
}

export function getMyDashboard(token: string) {
  return apiFetch<MyDashboard>("/my/dashboard/", { method: "GET" }, token);
}

export interface ClockStatus {
  clock_in: string | null;
  clock_out: string | null;
}

export function clockIn(token: string) {
  return apiFetch<ClockStatus>("/my/clock-in/", { method: "POST" }, token);
}

export function clockOut(token: string) {
  return apiFetch<ClockStatus>("/my/clock-out/", { method: "POST" }, token);
}

export interface MyOnboardingChecklist {
  onboarding: { status: string; start_date: string } | null;
  tasks: OnboardingTask[];
}

export function getMyOnboardingChecklist(token: string) {
  return apiFetch<MyOnboardingChecklist>("/my/onboarding-checklist/", { method: "GET" }, token);
}

export interface MyTalent {
  goals: Goal[];
  appraisals: Appraisal[];
  competency_ratings: CompetencyRating[];
}

export function getMyTalent(token: string) {
  return apiFetch<MyTalent>("/my/talent/", { method: "GET" }, token);
}

export function listMyBenefitClaims(token: string) {
  return apiFetch<BenefitClaim[]>("/my/benefit-claims/", { method: "GET" }, token);
}

export function submitMyBenefitClaim(token: string, data: Omit<BenefitClaimWrite, "employee">) {
  return apiFetch<BenefitClaim>("/my/benefit-claims/", { method: "POST", body: JSON.stringify(data) }, token);
}

export function listMySupportTickets(token: string) {
  return apiFetch<SupportTicket[]>("/my/support-tickets/", { method: "GET" }, token);
}

export function submitMySupportTicket(token: string, data: Omit<SupportTicketWrite, "employee">) {
  return apiFetch<SupportTicket>("/my/support-tickets/", { method: "POST", body: JSON.stringify(data) }, token);
}
