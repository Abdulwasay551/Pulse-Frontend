import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Award,
  ArrowLeftRight,
  Banknote,
  BadgeCheck,
  BarChart3,
  Boxes,
  Briefcase,
  Building2,
  CalendarCheck,
  CalendarClock,
  Clock,
  ClipboardCheck,
  FileCheck,
  FileSignature,
  FileText,
  Globe2,
  GraduationCap,
  Grid3x3,
  HeartPulse,
  IdCard,
  Landmark,
  Laptop,
  Layers,
  LifeBuoy,
  Map,
  Network,
  PieChart,
  Receipt,
  Repeat,
  ScanSearch,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
  UserCheck,
  UserMinus,
  UserSquare,
  Users,
  Wallet,
} from "lucide-react";

export interface ModuleFeature {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Present = a real, working page. Absent = routes to the "coming soon"
   * placeholder instead — every feature is navigable, real or not. */
  href?: string;
}

export interface ModuleFeatureSection {
  label: string;
  icon: LucideIcon;
  features: ModuleFeature[];
}

export interface ModuleNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface ModuleDef {
  key: string;
  label: string;
  icon: LucideIcon;
  description: string;
  overviewHref: string;
  /** Flat links shown right under Overview, outside any collapsible
   * section — for module-level pages that aren't one of the PDF's
   * functional groupings (e.g. Recruit's Analytics). */
  extraLinks: ModuleNavLink[];
  /** Each module searches its own data — there's no cross-module search
   * (they're separate apps with separate data), so the Topbar's search
   * placeholder reflects whichever module is currently active. */
  searchPlaceholder: string;
  sections: ModuleFeatureSection[];
}

// The single source of truth for every module's feature taxonomy, sourced
// from the Evo HRIS functional spec (Acquisition/Onboarding/Off boarding for
// Recruit; Attendance Management/Employee Engagement/Employee Records/
// Workforce Dashboard for People; Goals & Appraisal/Learning & Growth for
// Talent; Payroll/Benefits for Payroll & Benefits; Assets Management for
// IT & Assets). Both the per-module Sidebar and every module's hub page
// render from this list, so a feature's real/"coming soon" status only
// ever needs updating in one place.
export const dashboardModules: ModuleDef[] = [
  {
    key: "recruit",
    label: "EVO-Recruit",
    icon: Users,
    description: "Applicant tracking, onboarding, offboarding, and rehire.",
    overviewHref: "/dashboard/recruit",
    searchPlaceholder: "Search candidates, clients, requisitions…",
    extraLinks: [{ href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 }],
    sections: [
      {
        label: "Acquisition",
        icon: Briefcase,
        features: [
          { label: "Clients", description: "Companies you place candidates with.", icon: Building2, href: "/dashboard/clients" },
          { label: "Job Openings", description: "Open roles across every client.", icon: Briefcase, href: "/dashboard/requisitions" },
          { label: "Candidates", description: "Full pipeline, every stage.", icon: Users, href: "/dashboard/candidates" },
          { label: "Resume Pool", description: "Every resume on file, searchable.", icon: FileText, href: "/dashboard/resume-pool" },
          { label: "Digital Offer Letters", description: "Draft, send, and track offers to signature.", icon: FileSignature, href: "/dashboard/offer-letters" },
          { label: "Background Check Integration", description: "Screening status before an offer is final.", icon: ShieldCheck, href: "/dashboard/background-checks" },
          { label: "AI Resume Screening", description: "Resume-to-requirements fit scoring.", icon: Sparkles, href: "/dashboard/resume-pool" },
          { label: "Candidate Portal", description: "Self-service status tracking for applicants.", icon: ScanSearch },
        ],
      },
      {
        label: "Onboarding",
        icon: ClipboardCheck,
        features: [
          { label: "Onboarding", description: "Pre-joining docs, orientation, training, portal access, probation, devices.", icon: ClipboardCheck, href: "/dashboard/onboarding" },
        ],
      },
      {
        label: "Off boarding",
        icon: UserMinus,
        features: [
          { label: "Offboarding", description: "Documents checklist, access status, hardware clearance.", icon: UserMinus, href: "/dashboard/offboarding" },
          { label: "Rehire & Alumni Pool", description: "Rehire eligibility and talent-pool retention.", icon: Repeat },
        ],
      },
    ],
  },
  {
    key: "people",
    label: "EVO-People Management",
    icon: IdCard,
    description: "HR core: employee records, engagement, and attendance.",
    overviewHref: "/dashboard/people",
    searchPlaceholder: "Search employees, org chart, documents…",
    extraLinks: [],
    sections: [
      {
        label: "Employee Records",
        icon: UserSquare,
        features: [
          { label: "Employee Database", description: "360° employee profiles in one place.", icon: UserSquare },
          { label: "Organizational Chart", description: "Reporting hierarchy across the company.", icon: Network },
          { label: "Employee Self-Service", description: "Update personal info, view payslips.", icon: UserCheck },
          { label: "Document Management", description: "Contracts, certifications, ID proofs.", icon: FileText },
        ],
      },
      {
        label: "Employee Engagement",
        icon: Activity,
        features: [
          { label: "Surveys", description: "Read the room across every team.", icon: Activity },
          { label: "Pulse Checks", description: "Lightweight, frequent sentiment checks.", icon: Activity },
          { label: "Recognition Programs", description: "Celebrate wins, department by department.", icon: Award },
          { label: "Promotion & Transfer Workflows", description: "Structured internal moves, within department.", icon: ArrowLeftRight },
        ],
      },
      {
        label: "Attendance Management",
        icon: Clock,
        features: [
          { label: "Clock-in / Clock-out Tracking", description: "Time tracking per employee.", icon: Clock },
          { label: "Overtime Tracking", description: "Flag and approve overtime hours.", icon: Timer },
          { label: "Shift Scheduling", description: "Per-department shift planning.", icon: CalendarClock },
          { label: "Leave & Absence Management", description: "Requests, approvals, and balances.", icon: CalendarCheck },
        ],
      },
      {
        label: "Workforce Dashboard",
        icon: BarChart3,
        features: [
          { label: "Headcount & Attrition Trends", description: "Forecasting powered by EVO-AI.", icon: BarChart3 },
          { label: "KPI Tracking Dashboards", description: "Day-to-day workforce KPIs.", icon: PieChart },
        ],
      },
    ],
  },
  {
    key: "talent",
    label: "EVO-Talent Management",
    icon: TrendingUp,
    description: "Goals, appraisals, learning, and succession planning.",
    overviewHref: "/dashboard/talent",
    searchPlaceholder: "Search goals, appraisals, learning paths…",
    extraLinks: [],
    sections: [
      {
        label: "Goals & Appraisal",
        icon: Target,
        features: [
          { label: "Goal Setting & KPIs", description: "Set and track goals per employee.", icon: Target },
          { label: "Performance Appraisals", description: "Yearly 360° feedback cycles.", icon: Star },
          { label: "Competency Mapping", description: "Map skills against role expectations.", icon: Layers },
          { label: "Value-Addition Scoring", description: "Performance scoring powered by EVO-AI.", icon: Sparkles },
        ],
      },
      {
        label: "Learning & Growth",
        icon: GraduationCap,
        features: [
          { label: "Learning Management System", description: "Training and course delivery.", icon: GraduationCap },
          { label: "Career Development Paths", description: "Mapped per department hierarchy.", icon: Map },
          { label: "Skills & Competency Mapping", description: "A living map of who can do what.", icon: Grid3x3 },
          { label: "Succession Planning", description: "9-box grid and succession candidates.", icon: Grid3x3 },
        ],
      },
    ],
  },
  {
    key: "payroll-benefits",
    label: "EVO-Payroll & Benefits",
    icon: Banknote,
    description: "Payroll processing, compliance, and employee benefits.",
    overviewHref: "/dashboard/payroll-benefits",
    searchPlaceholder: "Search payroll runs, benefits, claims…",
    extraLinks: [],
    sections: [
      {
        label: "Payroll",
        icon: Wallet,
        features: [
          { label: "Payroll Processing & Payslips", description: "Process pay runs and view payslips.", icon: Wallet, href: "/dashboard/payroll" },
          { label: "Multi-Country Tax Compliance", description: "Stay compliant across every jurisdiction.", icon: Globe2 },
          { label: "Multi-Currency & Compliance Calendar", description: "Multi-currency support with key dates tracked.", icon: Globe2 },
          { label: "Direct Deposit / Banking Integration", description: "Banking integration for payouts.", icon: Landmark },
          { label: "Payroll Audit & Reconciliation", description: "Reports for every run.", icon: FileCheck },
        ],
      },
      {
        label: "Benefits",
        icon: HeartPulse,
        features: [
          { label: "Benefits Enrollment", description: "Health insurance, yearly bonuses.", icon: HeartPulse },
          { label: "Claims & Reimbursement", description: "Submission and approval workflows.", icon: Receipt },
          { label: "Benefit Cost Analysis", description: "See what benefits actually cost.", icon: PieChart },
        ],
      },
    ],
  },
  {
    key: "it-assets",
    label: "EVO-IT & Asset Management",
    icon: Laptop,
    description: "Device lifecycle, support tickets, and compliance.",
    overviewHref: "/dashboard/it-assets",
    searchPlaceholder: "Search devices, tickets, assets…",
    extraLinks: [],
    sections: [
      {
        label: "Assets Management",
        icon: Boxes,
        features: [
          { label: "Device Provisioning", description: "Tied to onboarding and offboarding.", icon: Boxes },
          { label: "Asset Inventory Tracking", description: "Laptops, monitors, and every assigned device.", icon: Boxes },
          { label: "Warranty Tracking", description: "Know what's covered, and until when.", icon: BadgeCheck },
          { label: "IT Support Requests", description: "Device queries and repair requests.", icon: LifeBuoy },
          { label: "Device Tracker", description: "Issue history, repairs, and damage records.", icon: Smartphone },
          { label: "BYOD Security Policy", description: "Track policy compliance per device.", icon: ShieldCheck },
        ],
      },
    ],
  },
];

export function comingSoonHref(moduleLabel: string, sectionLabel: string, feature: ModuleFeature): string {
  const params = new URLSearchParams({
    module: moduleLabel,
    section: sectionLabel,
    feature: feature.label,
    description: feature.description,
  });
  return `/dashboard/coming-soon?${params.toString()}`;
}

export function featureHref(moduleDef: ModuleDef, section: ModuleFeatureSection, feature: ModuleFeature): string {
  return feature.href ?? comingSoonHref(moduleDef.label, section.label, feature);
}

export function findActiveModule(pathname: string): ModuleDef | null {
  return (
    dashboardModules.find(
      (m) =>
        m.overviewHref === pathname ||
        m.extraLinks.some((l) => l.href === pathname) ||
        m.sections.some((s) => s.features.some((f) => f.href === pathname))
    ) ?? null
  );
}
