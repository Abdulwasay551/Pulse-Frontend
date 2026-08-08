import { apiFetch, downloadFile } from "./auth-api";
import { csvApi, resourceApi } from "./api-resource";

export type EmployeeStatus = "Active" | "On Leave" | "Terminated";
export type SalaryType = "Hourly" | "Salaried" | "Contract";

export interface EmployeeDocument {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  doc_type: "Contract" | "Certification" | "ID Proof" | "Other";
  title: string;
  file: string;
  uploaded_at: string;
}

export interface Employee {
  id: number;
  name: string;
  initials: string;
  email: string;
  phone: string;
  job_title: string;
  department: string;
  client_name: string;
  manager: number | null;
  manager_name: string | null;
  direct_reports_count: number;
  salary_type: SalaryType | "";
  location: string;
  hire_date: string;
  permanent_date: string | null;
  status: EmployeeStatus;
  monthly_salary: string | null;
  source_candidate: number | null;
  portal_token: string;
  documents: EmployeeDocument[];
  created_at: string;
  updated_at: string;
}

export interface EmployeeWrite {
  name: string;
  email?: string;
  phone?: string;
  job_title?: string;
  department?: string;
  client_name?: string;
  manager?: number | null;
  salary_type?: SalaryType | "";
  location?: string;
  hire_date?: string;
  permanent_date?: string | null;
  status?: EmployeeStatus;
  monthly_salary?: number | string | null;
}

export interface EmployeeDocumentWrite {
  employee: number;
  doc_type: EmployeeDocument["doc_type"];
  title: string;
  file: File;
}

export interface EmployeeLite {
  id: number;
  name: string;
  initials: string;
  job_title: string;
  department: string;
}

export interface PeopleDashboardSummary {
  overview_stats: { label: string; value: string; change: string; href: string }[];
  department_breakdown: { label: string; percent: number }[];
  status_breakdown: { label: string; count: number }[];
  kpis: { label: string; value: string; href: string }[];
}

export const employeesApi = resourceApi<Employee, EmployeeWrite>("/people/employees/");
export const employeesCsv = csvApi("/people/employees/", "employees.csv");

export function getPeopleDashboardSummary(token: string) {
  return apiFetch<PeopleDashboardSummary>("/people/dashboard-summary/", { method: "GET" }, token);
}

export function listEmployeeDocuments(token: string) {
  return apiFetch<EmployeeDocument[]>("/people/employee-documents/", { method: "GET" }, token);
}

export function uploadEmployeeDocument(token: string, data: EmployeeDocumentWrite) {
  const formData = new FormData();
  formData.append("employee", String(data.employee));
  formData.append("doc_type", data.doc_type);
  formData.append("title", data.title);
  formData.append("file", data.file);
  return apiFetch<EmployeeDocument>("/people/employee-documents/", { method: "POST", body: formData }, token);
}

export function deleteEmployeeDocument(token: string, id: number) {
  return apiFetch<void>(`/people/employee-documents/${id}/`, { method: "DELETE" }, token);
}

// --- Attendance Management ---

export interface AttendanceRecord {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  date: string;
  clock_in: string | null;
  clock_out: string | null;
  overtime_hours: string;
  notes: string;
  created_at: string;
}

export interface AttendanceRecordWrite {
  employee: number;
  date?: string;
  clock_in?: string | null;
  clock_out?: string | null;
  overtime_hours?: number | string;
  notes?: string;
}

export const attendanceRecordsApi = resourceApi<AttendanceRecord, AttendanceRecordWrite>("/people/attendance-records/");
export const attendanceRecordsCsv = csvApi("/people/attendance-records/", "attendance-records.csv");

export interface Shift {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  date: string;
  start_time: string;
  end_time: string;
  notes: string;
  created_at: string;
}

export interface ShiftWrite {
  employee: number;
  date?: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export const shiftsApi = resourceApi<Shift, ShiftWrite>("/people/shifts/");
export const shiftsCsv = csvApi("/people/shifts/", "shifts.csv");

export type LeaveType = "Vacation" | "Sick" | "Personal" | "Unpaid" | "Other";
export type LeaveStatus = "Pending" | "Approved" | "Rejected";

export interface LeaveRequest {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  hours: string | null;
  status: LeaveStatus;
  reason: string;
  created_at: string;
}

export interface LeaveRequestWrite {
  employee: number;
  leave_type?: LeaveType;
  start_date: string;
  end_date: string;
  hours?: number | string | null;
  status?: LeaveStatus;
  reason?: string;
}

export const leaveRequestsApi = resourceApi<LeaveRequest, LeaveRequestWrite>("/people/leave-requests/");
export const leaveRequestsCsv = csvApi("/people/leave-requests/", "time-off.csv");

// --- Employee Engagement ---

export type SurveyKind = "Survey" | "Pulse Check";

export interface SurveyResponse {
  id: number;
  survey: number;
  employee: number;
  employee_detail: EmployeeLite;
  rating: number | null;
  response_text: string;
  submitted_at: string;
}

export interface SurveyResponseWrite {
  survey: number;
  employee: number;
  rating?: number | null;
  response_text?: string;
}

export const surveyResponsesApi = resourceApi<SurveyResponse, SurveyResponseWrite>("/people/survey-responses/");

export type SurveyFrequency = "Yearly" | "Bi-yearly";

export interface Survey {
  id: number;
  kind: SurveyKind;
  title: string;
  questions: string[];
  frequency: SurveyFrequency | null;
  is_open: boolean;
  responses: SurveyResponse[];
  response_count: number;
  average_rating: number | null;
  created_at: string;
}

export interface SurveyWrite {
  kind?: SurveyKind;
  title: string;
  questions: string[];
  frequency?: SurveyFrequency | null;
  is_open?: boolean;
}

export const surveysApi = resourceApi<Survey, SurveyWrite>("/people/surveys/");
export const surveysCsv = csvApi("/people/surveys/", "surveys.csv");

export const RECOGNITION_TYPES = [
  "Employee of the Month",
  "Work Anniversary",
  "Above & Beyond",
  "Team Player",
  "Innovation Award",
  "Milestone Achievement",
] as const;
export type RecognitionType = (typeof RECOGNITION_TYPES)[number];

export interface Recognition {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  recognition_type: RecognitionType;
  given_by: string;
  message: string;
  created_at: string;
}

export interface RecognitionWrite {
  employee: number;
  recognition_type?: RecognitionType;
  given_by?: string;
  message?: string;
}

export const recognitionsApi = resourceApi<Recognition, RecognitionWrite>("/people/recognitions/");
export const recognitionsCsv = csvApi("/people/recognitions/", "recognitions.csv");

export function downloadRecognitionCertificate(token: string, id: number, employeeName: string) {
  const filename = `${employeeName.replace(/\s+/g, "-")}-recognition-certificate.pdf`;
  return downloadFile(`/people/recognitions/${id}/certificate/`, token, filename);
}

export type PromotionStatus = "Pending" | "Approved" | "Rejected";

export interface PromotionRequest {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  from_title: string;
  to_title: string;
  from_department: string;
  to_department: string;
  effective_date: string | null;
  status: PromotionStatus;
  notes: string;
  created_at: string;
}

export interface PromotionRequestWrite {
  employee: number;
  from_title?: string;
  to_title?: string;
  from_department?: string;
  to_department?: string;
  effective_date?: string | null;
  status?: PromotionStatus;
  notes?: string;
}

export const promotionRequestsApi = resourceApi<PromotionRequest, PromotionRequestWrite>("/people/promotion-requests/");
export const promotionRequestsCsv = csvApi("/people/promotion-requests/", "promotion-requests.csv");
