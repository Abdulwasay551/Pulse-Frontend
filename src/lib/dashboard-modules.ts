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
  ClipboardList,
  FileCheck,
  FileSignature,
  FileText,
  Globe2,
  GraduationCap,
  Grid3x3,
  HeartPulse,
  IdCard,
  KeyRound,
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
  /** Exact wording from the Evo HRIS functional spec — this is the
   * sub-sub-module name, shown verbatim in the sidebar flyout and on the
   * hub page tile. Don't paraphrase; if the spec changes, update here. */
  label: string;
  description: string;
  icon: LucideIcon;
  /** Present = a real, working page. Absent = routes to the "coming soon"
   * placeholder instead — every feature is navigable, real or not. */
  href?: string;
}

export interface ModuleFeatureSection {
  /** The sub-module name (e.g. "Acquisition", "Attendance Management") —
   * exact wording from the spec. */
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
  /** The module name (e.g. "EVO-Recruit") — one module = one dashboard. */
  label: string;
  icon: LucideIcon;
  description: string;
  overviewHref: string;
  /** Flat links shown right under Overview, outside any collapsible
   * sub-module — for module-level pages that aren't part of the spec's
   * functional groupings (e.g. Recruit's Analytics). */
  extraLinks: ModuleNavLink[];
  /** Each module searches its own data — there's no cross-module search
   * (they're separate apps with separate data), so the Topbar's search
   * placeholder reflects whichever module is currently active. */
  searchPlaceholder: string;
  sections: ModuleFeatureSection[];
}

const onboardingHref = (category: string) => `/dashboard/onboarding?category=${encodeURIComponent(category)}`;
const offboardingHref = (category: string) => `/dashboard/offboarding?category=${encodeURIComponent(category)}`;

// The single source of truth for every module's three-level feature
// hierarchy — module (one dashboard) -> sub-module (collapsible section) ->
// sub-sub-module (a feature/leaf) — sourced verbatim from the Evo HRIS
// functional spec. Both the per-module Sidebar and every module's hub page
// render from this list, so a feature's exact name, grouping, and real/
// "coming soon" status only ever need updating in one place.
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
          { label: "AI Resume Screening", description: "Resume-to-requirements fit scoring.", icon: Sparkles, href: "/dashboard/ai-resume-screening" },
          { label: "Candidate Portal", description: "Self-service status tracking for applicants.", icon: ScanSearch },
        ],
      },
      {
        label: "Onboarding",
        icon: ClipboardCheck,
        features: [
          { label: "Pre-Joining Documents", description: "Documents collected before day one.", icon: FileText, href: onboardingHref("Pre-Joining Documents") },
          { label: "Orientation", description: "Company orientation scheduling.", icon: CalendarCheck, href: onboardingHref("Orientation") },
          { label: "Training Plan and Schedule", description: "30/60/90 training plans.", icon: ClipboardList, href: onboardingHref("Training Plan") },
          { label: "Portal Access and Installations", description: "HR/payroll portal accounts and software installs.", icon: KeyRound, href: onboardingHref("Portal Access") },
          { label: "Probation Evaluation", description: "Probation-period review and sign-off.", icon: Star, href: onboardingHref("Probation Evaluation") },
          { label: "Device Assignment", description: "Laptop, badge, and hardware handoff.", icon: Laptop, href: onboardingHref("Device Assignment") },
        ],
      },
      {
        label: "Off boarding",
        icon: UserMinus,
        features: [
          { label: "Documents Checklist", description: "Exit paperwork and final settlement.", icon: FileText, href: offboardingHref("Documents Checklist") },
          { label: "Access Status", description: "Email, SSO, and system access revocation.", icon: KeyRound, href: offboardingHref("Access Status") },
          { label: "Hardware Clearance", description: "Laptop and badge return.", icon: Laptop, href: offboardingHref("Hardware Clearance") },
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
        label: "Attendance Management",
        icon: Clock,
        features: [
          { label: "Clock-in/Clock-out Tracking", description: "Time tracking per employee.", icon: Clock },
          { label: "Overtime Tracking", description: "Flag and approve overtime hours.", icon: Timer },
          { label: "Shift Scheduling per Department", description: "Per-department shift planning.", icon: CalendarClock },
          { label: "Leave & Absence Management", description: "Requests, approvals, and balances.", icon: CalendarCheck },
        ],
      },
      {
        label: "Employee Engagement",
        icon: Activity,
        features: [
          { label: "Surveys", description: "Read the room across every team.", icon: Activity },
          { label: "Pulse Checks", description: "Lightweight, frequent sentiment checks.", icon: Activity },
          { label: "Recognition Programs", description: "Celebrate wins, department by department.", icon: Award },
          { label: "Promotion & Transfer Workflows within Department", description: "Structured internal moves.", icon: ArrowLeftRight },
        ],
      },
      {
        label: "Employee Records",
        icon: UserSquare,
        features: [
          { label: "Employee Database / 360° Profiles", description: "Every employee, one place.", icon: UserSquare },
          { label: "Organizational Chart & Reporting Hierarchy", description: "Reporting lines across the company.", icon: Network },
          { label: "Employee Self-Service", description: "Update personal info, view payslips.", icon: UserCheck },
          { label: "Document Management", description: "Contracts, certifications, ID proofs.", icon: FileText },
        ],
      },
      {
        label: "Workforce Dashboard",
        icon: BarChart3,
        features: [
          { label: "Headcount Forecasting & Attrition Trends", description: "Powered by EVO-AI.", icon: BarChart3 },
          { label: "Day-to-Day KPI Tracking Dashboards", description: "Live workforce KPIs.", icon: PieChart },
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
          { label: "Performance Appraisals", description: "Based on yearly 360° feedback.", icon: Star },
          { label: "Competency Mapping of Employees", description: "Map skills against role expectations.", icon: Layers },
          { label: "Value-Addition / Performance Scoring", description: "Powered by EVO-AI.", icon: Sparkles },
        ],
      },
      {
        label: "Learning & Growth",
        icon: GraduationCap,
        features: [
          { label: "Training & Learning Management System (LMS)", description: "Training and course delivery.", icon: GraduationCap },
          { label: "Career Development Paths", description: "Mapped per department hierarchy.", icon: Map },
          { label: "Skills & Competency Mapping", description: "A living map of who can do what.", icon: Grid3x3 },
          { label: "Succession Planning / 9-Box Grid", description: "Succession candidates, mapped.", icon: Grid3x3 },
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
          { label: "Payroll Processing, Payslips", description: "Process pay runs and view payslips.", icon: Wallet, href: "/dashboard/payroll" },
          { label: "Multi-Country Tax Compliance", description: "Stay compliant across every jurisdiction.", icon: Globe2 },
          { label: "Multi-Currency Support & Compliance Calendar", description: "Multi-currency support with key dates tracked.", icon: Globe2 },
          { label: "Direct Deposit / Banking Integration", description: "Banking integration for payouts.", icon: Landmark },
          { label: "Payroll Audit & Reconciliation Reports", description: "Reports for every run.", icon: FileCheck },
        ],
      },
      {
        label: "Benefits",
        icon: HeartPulse,
        features: [
          { label: "Benefits Enrollment", description: "Health insurance, yearly bonuses.", icon: HeartPulse },
          { label: "Claims & Reimbursement Workflows", description: "Submission and approval workflows.", icon: Receipt },
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
          { label: "IT Support Requests Management", description: "Device queries and repair requests.", icon: LifeBuoy },
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

/** Next's usePathname() never includes the query string, but some feature
 * hrefs do (e.g. the onboarding/offboarding category cross-sections,
 * "/dashboard/onboarding?category=Orientation") — strip it before comparing
 * against a bare pathname, or every one of those routes would fail to match
 * its module/section and the sidebar would simply disappear. */
export function hrefPathname(href: string): string {
  return href.split("?")[0];
}

export function findActiveModule(pathname: string): ModuleDef | null {
  return (
    dashboardModules.find(
      (m) =>
        m.overviewHref === pathname ||
        m.extraLinks.some((l) => l.href === pathname) ||
        m.sections.some((s) => s.features.some((f) => f.href && hrefPathname(f.href) === pathname))
    ) ?? null
  );
}
