import { Banknote, FileCheck, Globe2, HeartPulse, Landmark, PieChart, Receipt, Wallet } from "lucide-react";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureSection from "@/components/dashboard/FeatureSection";
import FeatureTile from "@/components/dashboard/FeatureTile";

export default function PayrollBenefitsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <ModuleHeader
        icon={Banknote}
        title="EVO-Payroll & Benefits"
        description="Payroll processing, compliance, and employee benefits."
      />

      <FeatureSection title="Payroll">
        <FeatureTile icon={Wallet} title="Payroll runs" description="Process pay runs and view payslips." href="/dashboard/payroll" />
        <FeatureTile icon={Globe2} title="Multi-country tax compliance" description="Multi-currency support and a compliance calendar." />
        <FeatureTile icon={Landmark} title="Direct deposit" description="Banking integration for payouts." />
        <FeatureTile icon={FileCheck} title="Payroll audit & reconciliation" description="Reports for every run." />
      </FeatureSection>

      <FeatureSection title="Benefits">
        <FeatureTile icon={HeartPulse} title="Benefits enrollment" description="Health insurance, yearly bonuses." />
        <FeatureTile icon={Receipt} title="Claims & reimbursement" description="Submission and approval workflows." />
        <FeatureTile icon={PieChart} title="Benefit cost analysis" description="See what benefits actually cost." />
      </FeatureSection>
    </div>
  );
}
