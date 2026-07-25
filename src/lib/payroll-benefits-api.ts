import { resourceApi } from "./api-resource";

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

export interface PayrollRunWrite {
  period: string;
  contractors: number;
  amount: number | string;
  status?: PayrollStatus;
}

export const payrollApi = resourceApi<PayrollRun, PayrollRunWrite>("/payroll-benefits/payroll-runs/");
