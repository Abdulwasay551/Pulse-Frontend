import { apiFetch } from "./auth-api";
import { resourceApi } from "./api-resource";
import type { EmployeeLite } from "./people-api";

export type GoalStatus = "Not Started" | "In Progress" | "Completed";

export interface Goal {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  title: string;
  description: string;
  target_date: string | null;
  status: GoalStatus;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface GoalWrite {
  employee: number;
  title: string;
  description?: string;
  target_date?: string | null;
  status?: GoalStatus;
  progress?: number;
}

export const goalsApi = resourceApi<Goal, GoalWrite>("/talent/goals/");

export type AppraisalStatus = "Draft" | "Submitted" | "Finalized";

export interface Appraisal {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  period: string;
  reviewer: string;
  overall_rating: number;
  strengths: string;
  areas_for_improvement: string;
  status: AppraisalStatus;
  created_at: string;
}

export interface AppraisalWrite {
  employee: number;
  period: string;
  reviewer?: string;
  overall_rating: number;
  strengths?: string;
  areas_for_improvement?: string;
  status?: AppraisalStatus;
}

export const appraisalsApi = resourceApi<Appraisal, AppraisalWrite>("/talent/appraisals/");

export interface CompetencyRating {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  competency: string;
  level: number;
  notes: string;
  created_at: string;
}

export interface CompetencyRatingWrite {
  employee: number;
  competency: string;
  level?: number;
  notes?: string;
}

export const competencyRatingsApi = resourceApi<CompetencyRating, CompetencyRatingWrite>("/talent/competency-ratings/");

export interface Course {
  id: number;
  title: string;
  description: string;
  duration_hours: number;
  is_active: boolean;
  enrolled_count: number;
  created_at: string;
}

export interface CourseWrite {
  title: string;
  description?: string;
  duration_hours?: number;
  is_active?: boolean;
}

export const coursesApi = resourceApi<Course, CourseWrite>("/talent/courses/");

export type EnrollmentStatus = "Not Started" | "In Progress" | "Completed";

export interface Enrollment {
  id: number;
  course: number;
  course_title: string;
  employee: number;
  employee_detail: EmployeeLite;
  status: EnrollmentStatus;
  completed_at: string | null;
  created_at: string;
}

export interface EnrollmentWrite {
  course: number;
  employee: number;
  status?: EnrollmentStatus;
  completed_at?: string | null;
}

export const enrollmentsApi = resourceApi<Enrollment, EnrollmentWrite>("/talent/enrollments/");

export interface CareerPath {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  current_role: string;
  target_role: string;
  department: string;
  milestones: string;
  target_date: string | null;
  created_at: string;
}

export interface CareerPathWrite {
  employee: number;
  current_role?: string;
  target_role?: string;
  department?: string;
  milestones?: string;
  target_date?: string | null;
}

export const careerPathsApi = resourceApi<CareerPath, CareerPathWrite>("/talent/career-paths/");

export type NineBoxRating = "Low" | "Medium" | "High";

export interface SuccessionPlan {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  potential_rating: NineBoxRating;
  performance_rating: NineBoxRating;
  successor_notes: string;
  ready_now: boolean;
  created_at: string;
  updated_at: string;
}

export interface SuccessionPlanWrite {
  employee: number;
  potential_rating?: NineBoxRating;
  performance_rating?: NineBoxRating;
  successor_notes?: string;
  ready_now?: boolean;
}

export const successionPlansApi = resourceApi<SuccessionPlan, SuccessionPlanWrite>("/talent/succession-plans/");

export interface EmployeeScore {
  employee: number;
  score: number | null;
  notes: string;
}

export function getEmployeeScore(token: string, employeeId: number) {
  return apiFetch<EmployeeScore>(`/talent/employees/${employeeId}/score/`, { method: "GET" }, token);
}

export interface TalentDashboardSummary {
  overview_stats: { label: string; value: string; change: string; href: string }[];
  kpis: { label: string; value: string; href: string }[];
  nine_box: Record<string, number>;
}

export function getTalentDashboardSummary(token: string) {
  return apiFetch<TalentDashboardSummary>("/talent/dashboard-summary/", { method: "GET" }, token);
}

export interface RecruiterFeedback {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  given_by: string;
  message: string;
  created_at: string;
}

export interface RecruiterFeedbackWrite {
  employee: number;
  given_by?: string;
  message: string;
}

export const recruiterFeedbackApi = resourceApi<RecruiterFeedback, RecruiterFeedbackWrite>("/talent/recruiter-feedback/");
