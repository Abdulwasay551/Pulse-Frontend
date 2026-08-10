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
  MessageSquareText,
  Network,
  PieChart,
  Receipt,
  Repeat,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Timer,
  TrendingUp,
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
  description: string;
  icon: LucideIcon;
  features: ModuleFeature[];
  /** A sub-module's own dashboard — stats plus this section's feature
   * cards, one level below the module hub. Present for every section in a
   * multi-section module; a single-section module (e.g. IT & Assets) has
   * no separate sub-dashboard since it would just duplicate the module
   * hub. For sections whose features already funnel through one real
   * flow (Onboarding, Off boarding, Workforce Dashboard), this points at
   * that existing page rather than a new one. */
  href?: string;
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
const surveysHref = (kind: string) => `/dashboard/surveys?kind=${encodeURIComponent(kind)}`;

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
        description: "Clients, requisitions, and the full candidate pipeline.",
        icon: Briefcase,
        href: "/dashboard/acquisition",
        features: [
          { label: "Clients", description: "Companies you place candidates with.", icon: Building2, href: "/dashboard/clients" },
          { label: "Job Openings", description: "Open roles across every client.", icon: Briefcase, href: "/dashboard/requisitions" },
          { label: "Candidates", description: "Full pipeline, every stage.", icon: Users, href: "/dashboard/candidates" },
          { label: "Resume Pool", description: "Every resume on file, searchable.", icon: FileText, href: "/dashboard/resume-pool" },
          { label: "Digital Offer Letters", description: "Draft, send, and track offers to signature.", icon: FileSignature, href: "/dashboard/offer-letters" },
          { label: "Background Check Integration", description: "Screening status before an offer is final.", icon: ShieldCheck, href: "/dashboard/background-checks" },
          { label: "AI Resume Screening", description: "Resume-to-requirements fit scoring.", icon: Sparkles, href: "/dashboard/ai-resume-screening" },
        ],
      },
      {
        label: "Onboarding",
        description: "Pre-joining documents through device assignment.",
        icon: ClipboardCheck,
        href: "/dashboard/onboarding",
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
        description: "Exit documents, access revocation, and rehire eligibility.",
        icon: UserMinus,
        href: "/dashboard/offboarding",
        features: [
          { label: "Documents Checklist", description: "Exit paperwork and final settlement.", icon: FileText, href: offboardingHref("Documents Checklist") },
          { label: "Access Status", description: "Email, SSO, and system access revocation.", icon: KeyRound, href: offboardingHref("Access Status") },
          { label: "Hardware Clearance", description: "Laptop and badge return.", icon: Laptop, href: offboardingHref("Hardware Clearance") },
          { label: "Rehire & Alumni Pool", description: "Rehire eligibility and talent-pool retention.", icon: Repeat, href: "/dashboard/rehire-pool" },
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
        description: "Clock-ins, overtime, shifts, and leave, in one place.",
        icon: Clock,
        href: "/dashboard/attendance-management",
        features: [
          { label: "Clock-in/Clock-out Tracking", description: "Time tracking per employee.", icon: Clock, href: "/dashboard/attendance?view=clock" },
          { label: "Overtime Tracking", description: "Flag and approve overtime hours.", icon: Timer, href: "/dashboard/attendance?view=overtime" },
          { label: "Shift Scheduling per Department", description: "Per-department shift planning.", icon: CalendarClock, href: "/dashboard/shift-scheduling" },
          { label: "Time Off", description: "Requests, approvals, and balances.", icon: CalendarCheck, href: "/dashboard/leave-requests" },
        ],
      },
      {
        label: "Employee Engagement",
        description: "Surveys, recognition, and internal moves.",
        icon: Activity,
        href: "/dashboard/employee-engagement",
        features: [
          { label: "Surveys", description: "Read the room across every team.", icon: Activity, href: surveysHref("Survey") },
          { label: "Pulse Checks", description: "Lightweight, frequent sentiment checks.", icon: Activity, href: surveysHref("Pulse Check") },
          { label: "Recognition Programs", description: "Celebrate wins, department by department.", icon: Award, href: "/dashboard/recognition" },
          { label: "Promotion & Transfer Workflows within Department", description: "Structured internal moves.", icon: ArrowLeftRight, href: "/dashboard/promotions" },
        ],
      },
      {
        label: "Employee Records",
        description: "Profiles, org chart, self-service, and documents.",
        icon: UserSquare,
        href: "/dashboard/employee-records",
        features: [
          { label: "Employee Database / 360° Profiles", description: "Every employee, one place.", icon: UserSquare, href: "/dashboard/employee-database?view=employees" },
          { label: "Organizational Chart & Reporting Hierarchy", description: "Reporting lines across the company.", icon: Network, href: "/dashboard/org-chart" },
        ],
      },
      {
        label: "Workforce Dashboard",
        description: "Headcount trends and day-to-day workforce KPIs.",
        icon: BarChart3,
        href: "/dashboard/workforce-dashboard",
        features: [
          { label: "Headcount Forecasting & Attrition Trends", description: "Powered by EVO-AI.", icon: BarChart3, href: "/dashboard/workforce-dashboard?view=forecast" },
          { label: "Day-to-Day KPI Tracking Dashboards", description: "Live workforce KPIs.", icon: PieChart, href: "/dashboard/workforce-dashboard?view=kpis" },
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
        description: "Goal tracking, reviews, and value-addition scoring.",
        icon: Target,
        href: "/dashboard/goals-appraisal",
        features: [
          { label: "Goal Setting & KPIs", description: "Set and track goals per employee.", icon: Target, href: "/dashboard/goals" },
          { label: "Performance Appraisals", description: "Based on yearly 360° feedback.", icon: Star, href: "/dashboard/appraisals?view=appraisals" },
          { label: "Competency Mapping of Employees", description: "Map skills against role expectations.", icon: Layers, href: "/dashboard/competency-mapping?view=employees" },
          { label: "Value-Addition / Performance Scoring", description: "Powered by EVO-AI.", icon: Sparkles, href: "/dashboard/appraisals?view=scores" },
          { label: "Recruiter Feedback", description: "Notes a recruiter leaves on a placed employee.", icon: MessageSquareText, href: "/dashboard/recruiter-feedback" },
        ],
      },
      {
        label: "Learning & Growth",
        description: "Courses, career paths, skills, and succession.",
        icon: GraduationCap,
        href: "/dashboard/learning-growth",
        features: [
          { label: "Training & Learning Management System (LMS)", description: "Training and course delivery.", icon: GraduationCap, href: "/dashboard/learning" },
          { label: "Career Development Paths", description: "Mapped per department hierarchy.", icon: Map, href: "/dashboard/career-paths" },
          { label: "Skills & Competency Mapping", description: "A living map of who can do what.", icon: Grid3x3, href: "/dashboard/competency-mapping?view=skills" },
          { label: "Succession Planning / 9-Box Grid", description: "Succession candidates, mapped.", icon: Grid3x3, href: "/dashboard/succession-planning" },
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
        description: "Processing, tax compliance, deposits, and audit.",
        icon: Wallet,
        href: "/dashboard/payroll-overview",
        features: [
          { label: "Payroll Processing, Payslips", description: "Process pay runs and view payslips.", icon: Wallet, href: "/dashboard/payroll" },
          { label: "Multi-Country Tax Compliance", description: "Stay compliant across every jurisdiction.", icon: Globe2, href: "/dashboard/tax-compliance" },
          { label: "Multi-Currency Support & Compliance Calendar", description: "Multi-currency support with key dates tracked.", icon: Globe2, href: "/dashboard/compliance-calendar" },
          { label: "Direct Deposit / Banking Integration", description: "Banking integration for payouts.", icon: Landmark, href: "/dashboard/direct-deposit" },
          { label: "Payroll Audit & Reconciliation Reports", description: "Reports for every run.", icon: FileCheck, href: "/dashboard/payroll-audit" },
        ],
      },
      {
        label: "Benefits",
        description: "Enrollment, claims, and cost analysis.",
        icon: HeartPulse,
        href: "/dashboard/benefits-overview",
        features: [
          { label: "Benefits Enrollment", description: "Health insurance, yearly bonuses.", icon: HeartPulse, href: "/dashboard/benefits-enrollment" },
          { label: "Claims, Reimbursement & Bonus Workflows", description: "Submission and approval workflows, including bonuses.", icon: Receipt, href: "/dashboard/claims" },
          { label: "Benefit Cost Analysis", description: "See what benefits actually cost.", icon: PieChart, href: "/dashboard/benefit-cost-analysis" },
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
        description: "Device lifecycle, warranty, support, and compliance.",
        icon: Boxes,
        features: [
          { label: "Device Provisioning", description: "Tied to onboarding and offboarding.", icon: Boxes, href: "/dashboard/device-provisioning" },
          { label: "Asset Inventory Tracking", description: "Laptops, monitors, and every assigned device.", icon: Boxes, href: "/dashboard/asset-inventory" },
          { label: "Warranty Tracking", description: "Know what's covered, and until when.", icon: BadgeCheck, href: "/dashboard/warranty-tracking" },
          { label: "IT Support Requests Management", description: "Device queries and repair requests.", icon: LifeBuoy, href: "/dashboard/it-support" },
          { label: "Device Tracker", description: "Issue history, repairs, and damage records.", icon: Smartphone, href: "/dashboard/device-tracker" },
          { label: "BYOD Security Policy", description: "Track policy compliance per device.", icon: ShieldCheck, href: "/dashboard/byod-policy" },
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
        m.sections.some(
          (s) =>
            (s.href && hrefPathname(s.href) === pathname) ||
            s.features.some((f) => f.href && hrefPathname(f.href) === pathname)
        )
    ) ?? null
  );
}

/** The "coming soon" placeholder isn't a real feature of any module (it's
 * the landing spot for every not-yet-built one), so findActiveModule alone
 * can't place it — without this, the sidebar would simply vanish on it.
 * Resolves the module via its `?module=` query param instead, falling back
 * to the normal pathname-based lookup for every other route. */
export function findActiveModuleForRoute(pathname: string, searchParams: URLSearchParams): ModuleDef | null {
  if (pathname === "/dashboard/coming-soon") {
    const label = searchParams.get("module");
    return dashboardModules.find((m) => m.label === label) ?? null;
  }
  return findActiveModule(pathname);
}

export interface Crumb {
  label: string;
  /** Absent = the current page, rendered as plain (non-link) text. */
  href?: string;
}

/** Derives a page's full breadcrumb trail (module → sub-module → feature)
 * straight from `dashboardModules`, the same source the Sidebar reads —
 * so a page's breadcrumb can never drift out of sync with where it
 * actually lives in the nav hierarchy. Returns an empty array for pages
 * with nothing meaningful to show (the root hub itself). */
export function getBreadcrumbTrail(pathname: string, searchParams: URLSearchParams): Crumb[] {
  const moduleDef = findActiveModuleForRoute(pathname, searchParams);

  if (pathname === "/dashboard/coming-soon") {
    const trail: Crumb[] = [];
    if (moduleDef) trail.push({ label: moduleDef.label, href: moduleDef.overviewHref });
    const sectionLabel = searchParams.get("section");
    const featureLabel = searchParams.get("feature");
    if (sectionLabel) trail.push({ label: sectionLabel });
    if (featureLabel) trail.push({ label: featureLabel });
    return trail;
  }

  if (!moduleDef) {
    if (pathname === "/dashboard/settings") return [{ label: "Settings" }];
    return [];
  }

  if (pathname === moduleDef.overviewHref) {
    return [{ label: moduleDef.label }];
  }

  const extraLink = moduleDef.extraLinks.find((l) => l.href === pathname);
  if (extraLink) {
    return [{ label: moduleDef.label, href: moduleDef.overviewHref }, { label: extraLink.label }];
  }

  const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

  // Exact match (pathname + query) against a feature's own href — the
  // precise case, since several features share a base pathname and are
  // only distinguished by a query string (e.g. attendance's two views).
  for (const section of moduleDef.sections) {
    for (const feature of section.features) {
      if (feature.href === currentUrl) {
        return [
          { label: moduleDef.label, href: moduleDef.overviewHref },
          { label: section.label, href: section.href },
          { label: feature.label },
        ];
      }
    }
  }

  // A sub-module's own hub page (e.g. Onboarding, Workforce Dashboard, or
  // one of the dedicated sub-dashboards) — matched by bare pathname since
  // these pages don't carry a distinguishing query string of their own.
  const section = moduleDef.sections.find((s) => s.href && hrefPathname(s.href) === pathname);
  if (section) {
    return [{ label: moduleDef.label, href: moduleDef.overviewHref }, { label: section.label }];
  }

  // Fallback: same pathname as a feature, but reached with a different
  // (or no) query string than that feature's own href specifies.
  for (const s of moduleDef.sections) {
    for (const feature of s.features) {
      if (feature.href && hrefPathname(feature.href) === pathname) {
        return [
          { label: moduleDef.label, href: moduleDef.overviewHref },
          { label: s.label, href: s.href },
          { label: feature.label },
        ];
      }
    }
  }

  return [{ label: moduleDef.label, href: moduleDef.overviewHref }];
}
