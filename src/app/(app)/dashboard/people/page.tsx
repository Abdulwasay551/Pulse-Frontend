import {
  Activity,
  ArrowLeftRight,
  Award,
  BarChart3,
  CalendarCheck,
  CalendarClock,
  Clock,
  FileText,
  IdCard,
  Network,
  Timer,
  UserCheck,
  UserSquare,
} from "lucide-react";
import ModuleHeader from "@/components/dashboard/ModuleHeader";
import FeatureSection from "@/components/dashboard/FeatureSection";
import FeatureTile from "@/components/dashboard/FeatureTile";

export default function PeopleManagementPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <ModuleHeader
        icon={IdCard}
        title="EVO-People Management"
        description="HR core: employee records, engagement, and attendance."
      />

      <FeatureSection title="Employee records">
        <FeatureTile icon={UserSquare} title="Employee database" description="360° employee profiles in one place." />
        <FeatureTile icon={Network} title="Org chart" description="Reporting hierarchy across the company." />
        <FeatureTile icon={UserCheck} title="Employee self-service" description="Update personal info, view payslips." />
        <FeatureTile icon={FileText} title="Document management" description="Contracts, certifications, ID proofs." />
      </FeatureSection>

      <FeatureSection title="Employee engagement">
        <FeatureTile icon={Activity} title="Surveys & pulse checks" description="Read the room across every team." />
        <FeatureTile icon={Award} title="Recognition programs" description="Celebrate wins, department by department." />
        <FeatureTile icon={ArrowLeftRight} title="Promotion & transfer" description="Workflows for internal moves." />
      </FeatureSection>

      <FeatureSection title="Attendance management">
        <FeatureTile icon={Clock} title="Clock-in / clock-out" description="Time tracking per employee." />
        <FeatureTile icon={Timer} title="Overtime tracking" description="Flag and approve overtime hours." />
        <FeatureTile icon={CalendarClock} title="Shift scheduling" description="Per-department shift planning." />
        <FeatureTile icon={CalendarCheck} title="Leave & absence" description="Requests, approvals, and balances." />
      </FeatureSection>

      <FeatureSection title="Workforce dashboard">
        <FeatureTile
          icon={BarChart3}
          title="Headcount & attrition trends"
          description="Forecasting powered by EVO-AI, plus day-to-day KPI tracking."
        />
      </FeatureSection>
    </div>
  );
}
