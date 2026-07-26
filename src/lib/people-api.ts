import { apiFetch } from "./auth-api";
import { csvApi, resourceApi } from "./api-resource";

export type EmployeeStatus = "Active" | "On Leave" | "Terminated";

export interface EmployeeDocument {
  id: number;
  employee: number;
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
  manager: number | null;
  manager_name: string | null;
  direct_reports_count: number;
  hire_date: string;
  status: EmployeeStatus;
  source_candidate: number | null;
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
  manager?: number | null;
  hire_date?: string;
  status?: EmployeeStatus;
}

export interface EmployeeDocumentWrite {
  employee: number;
  doc_type: EmployeeDocument["doc_type"];
  title: string;
  file: File;
}

export interface PeopleDashboardSummary {
  overview_stats: { label: string; value: string; change: string; href: string }[];
  department_breakdown: { label: string; percent: number }[];
  status_breakdown: { label: string; count: number }[];
}

export const employeesApi = resourceApi<Employee, EmployeeWrite>("/people/employees/");
export const employeesCsv = csvApi("/people/employees/", "employees.csv");

export function getPeopleDashboardSummary(token: string) {
  return apiFetch<PeopleDashboardSummary>("/people/dashboard-summary/", { method: "GET" }, token);
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
