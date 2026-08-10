import { apiFetch } from "./auth-api";
import { csvApi, resourceApi } from "./api-resource";
import type { EmployeeLite } from "./people-api";

export type PayrollStatus = "Reconciled" | "Needs review" | "Processing";

export interface PayrollRun {
  id: number;
  period: string;
  contractors: number;
  amount: string;
  currency: string;
  status: PayrollStatus;
  discrepancy_flagged: boolean;
  audit_notes: string;
  created_at: string;
  updated_at: string;
}

export interface PayrollRunWrite {
  period: string;
  contractors: number;
  amount: number | string;
  currency?: string;
  status?: PayrollStatus;
  discrepancy_flagged?: boolean;
  audit_notes?: string;
}

export const payrollApi = resourceApi<PayrollRun, PayrollRunWrite>("/payroll-benefits/payroll-runs/");
export const payrollCsv = csvApi("/payroll-benefits/payroll-runs/", "payroll-runs.csv");

export interface PayrollAuditEntry {
  id: number;
  message: string;
  tone: "primary" | "amber" | "maroon" | "neutral";
  created_at: string;
}

export function getPayrollAuditTrail(token: string) {
  return apiFetch<PayrollAuditEntry[]>("/payroll-benefits/payroll-runs/audit_trail/", { method: "GET" }, token);
}

export type FilingStatus = "Single" | "Married" | "Head of Household" | "Not Applicable";
export type ComplianceStatus = "Compliant" | "Pending Review" | "Action Required";

export interface TaxProfile {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  country: string;
  tax_id: string;
  filing_status: FilingStatus;
  compliance_status: ComplianceStatus;
  notes: string;
  last_reviewed: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxProfileWrite {
  employee: number;
  country: string;
  tax_id?: string;
  filing_status?: FilingStatus;
  compliance_status?: ComplianceStatus;
  notes?: string;
  last_reviewed?: string | null;
}

export const taxProfilesApi = resourceApi<TaxProfile, TaxProfileWrite>("/payroll-benefits/tax-profiles/");
export const taxProfilesCsv = csvApi("/payroll-benefits/tax-profiles/", "tax-profiles.csv");

export interface ExchangeRate {
  id: number;
  currency: string;
  rate_to_usd: string;
  updated_at: string;
}

export interface ExchangeRateWrite {
  currency: string;
  rate_to_usd: number | string;
}

export const exchangeRatesApi = resourceApi<ExchangeRate, ExchangeRateWrite>("/payroll-benefits/exchange-rates/");

export interface CurrencyConversion {
  amount: number;
  from: string;
  to: string;
  result: number;
}

export function convertCurrency(token: string, amount: string, from: string, to: string) {
  const params = new URLSearchParams({ amount, from, to });
  return apiFetch<CurrencyConversion>(`/payroll-benefits/exchange-rates/convert/?${params}`, { method: "GET" }, token);
}

export type ComplianceCategory = "Tax Filing" | "Currency Update" | "Regulatory";
export type CalendarStatus = "Upcoming" | "Due soon" | "Overdue" | "Completed";

export interface ComplianceEvent {
  id: number;
  country: string;
  title: string;
  category: ComplianceCategory;
  due_date: string;
  amount: string | null;
  currency: string;
  responsible_party: string;
  linked_payroll_run: number | null;
  linked_payroll_run_period: string | null;
  completed: boolean;
  notes: string;
  calendar_status: CalendarStatus;
  created_at: string;
  updated_at: string;
}

export interface ComplianceEventWrite {
  country: string;
  title: string;
  category?: ComplianceCategory;
  due_date: string;
  amount?: number | string | null;
  currency?: string;
  responsible_party?: string;
  linked_payroll_run?: number | null;
  completed?: boolean;
  notes?: string;
}

export const complianceEventsApi = resourceApi<ComplianceEvent, ComplianceEventWrite>("/payroll-benefits/compliance-events/");
export const complianceEventsCsv = csvApi("/payroll-benefits/compliance-events/", "compliance-events.csv");

export type BankAccountType = "Checking" | "Savings";

export interface BankAccount {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  bank_name: string;
  bank_country: string;
  account_holder_name: string;
  account_number_last4: string;
  routing_number: string;
  account_type: BankAccountType;
  is_primary: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankAccountWrite {
  employee: number;
  bank_name: string;
  bank_country?: string;
  account_holder_name: string;
  account_number: string;
  routing_number?: string;
  account_type?: BankAccountType;
  is_primary?: boolean;
  verified?: boolean;
}

export const bankAccountsApi = resourceApi<BankAccount, BankAccountWrite>("/payroll-benefits/bank-accounts/");
export const bankAccountsCsv = csvApi("/payroll-benefits/bank-accounts/", "bank-accounts.csv");

export type BenefitPlanType = "Health" | "Dental" | "Vision" | "Retirement" | "Life Insurance" | "Other";

export interface BenefitPlan {
  id: number;
  name: string;
  plan_type: BenefitPlanType;
  provider: string;
  employee_cost: string;
  employer_cost: string;
  description: string;
  is_active: boolean;
  enrolled_count: number;
  created_at: string;
  updated_at: string;
}

export interface BenefitPlanWrite {
  name: string;
  plan_type?: BenefitPlanType;
  provider?: string;
  employee_cost?: number | string;
  employer_cost?: number | string;
  description?: string;
  is_active?: boolean;
}

export const benefitPlansApi = resourceApi<BenefitPlan, BenefitPlanWrite>("/payroll-benefits/benefit-plans/");
export const benefitPlansCsv = csvApi("/payroll-benefits/benefit-plans/", "benefit-plans.csv");

export type CoverageLevel = "Employee Only" | "Employee + Spouse" | "Employee + Children" | "Family";
export type EnrollmentStatus = "Enrolled" | "Pending" | "Waived" | "Terminated";

export interface BenefitEnrollment {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  plan: number;
  plan_detail: BenefitPlan;
  coverage_level: CoverageLevel;
  status: EnrollmentStatus;
  enrolled_at: string | null;
  terminated_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BenefitEnrollmentWrite {
  employee: number;
  plan: number;
  coverage_level?: CoverageLevel;
  status?: EnrollmentStatus;
}

export const benefitEnrollmentsApi = resourceApi<BenefitEnrollment, BenefitEnrollmentWrite>(
  "/payroll-benefits/benefit-enrollments/"
);
export const benefitEnrollmentsCsv = csvApi("/payroll-benefits/benefit-enrollments/", "benefit-enrollments.csv");

export type ClaimStatus = "Submitted" | "Under Review" | "Approved" | "Rejected" | "Paid";

export interface BenefitClaim {
  id: number;
  employee: number;
  employee_detail: EmployeeLite;
  plan: number | null;
  plan_name: string;
  claim_type: string;
  amount: string;
  description: string;
  status: ClaimStatus;
  submitted_at: string;
  resolved_at: string | null;
}

export interface BenefitClaimWrite {
  employee: number;
  plan?: number | null;
  claim_type: string;
  amount: number | string;
  description?: string;
  status?: ClaimStatus;
}

export const benefitClaimsApi = resourceApi<BenefitClaim, BenefitClaimWrite>("/payroll-benefits/benefit-claims/");
export const benefitClaimsCsv = csvApi("/payroll-benefits/benefit-claims/", "benefit-claims.csv");

export interface PayrollBenefitsDashboardSummary {
  overview_stats: { label: string; value: string; change: string; href: string }[];
  benefit_cost_by_type: { label: string; value: number }[];
  benefit_cost_by_department: { label: string; value: number }[];
  benefit_cost_by_location: { label: string; value: number }[];
  benefit_cost_by_employee: { label: string; value: number }[];
  total_monthly_benefit_cost: number;
  payroll_trend: { label: string; value: number; currency: string }[];
}

export function getPayrollBenefitsDashboardSummary(token: string) {
  return apiFetch<PayrollBenefitsDashboardSummary>("/payroll-benefits/dashboard-summary/", { method: "GET" }, token);
}
