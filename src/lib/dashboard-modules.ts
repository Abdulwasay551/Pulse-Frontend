import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Briefcase,
  Building2,
  ClipboardCheck,
  FileSignature,
  FileText,
  LayoutGrid,
  ShieldCheck,
  UserMinus,
  Users,
  Wallet,
} from "lucide-react";

export interface ModuleNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface ModuleDef {
  key: string;
  label: string;
  items: ModuleNavItem[];
  /** Each module searches its own data — there's no cross-module search
   * (they're separate apps with separate data), so the Topbar's search
   * placeholder reflects whichever module is currently active. */
  searchPlaceholder: string;
}

// Each module owns its own sidebar (see Sidebar.tsx) instead of one flat,
// always-visible list of all five — this is the single source of truth for
// which sub-pages belong to which module, shared with DashboardShell so it
// knows whether the current route has a sidebar at all (the hub page and
// Settings don't).
export const dashboardModules: ModuleDef[] = [
  {
    key: "recruit",
    label: "EVO-Recruit",
    searchPlaceholder: "Search candidates, clients, requisitions…",
    items: [
      { href: "/dashboard/recruit", label: "Overview", icon: LayoutGrid },
      { href: "/dashboard/candidates", label: "Candidates", icon: Users },
      { href: "/dashboard/clients", label: "Clients", icon: Building2 },
      { href: "/dashboard/requisitions", label: "Requisitions", icon: Briefcase },
      { href: "/dashboard/resume-pool", label: "Resume Pool", icon: FileText },
      { href: "/dashboard/offer-letters", label: "Offer Letters", icon: FileSignature },
      { href: "/dashboard/background-checks", label: "Background Checks", icon: ShieldCheck },
      { href: "/dashboard/onboarding", label: "Onboarding", icon: ClipboardCheck },
      { href: "/dashboard/offboarding", label: "Offboarding", icon: UserMinus },
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    key: "people",
    label: "EVO-People Management",
    searchPlaceholder: "Search employees, org chart, documents…",
    items: [{ href: "/dashboard/people", label: "Overview", icon: LayoutGrid }],
  },
  {
    key: "talent",
    label: "EVO-Talent Management",
    searchPlaceholder: "Search goals, appraisals, learning paths…",
    items: [{ href: "/dashboard/talent", label: "Overview", icon: LayoutGrid }],
  },
  {
    key: "payroll-benefits",
    label: "EVO-Payroll & Benefits",
    searchPlaceholder: "Search payroll runs, benefits, claims…",
    items: [
      { href: "/dashboard/payroll-benefits", label: "Overview", icon: LayoutGrid },
      { href: "/dashboard/payroll", label: "Payroll runs", icon: Wallet },
    ],
  },
  {
    key: "it-assets",
    label: "EVO-IT & Asset Management",
    searchPlaceholder: "Search devices, tickets, assets…",
    items: [{ href: "/dashboard/it-assets", label: "Overview", icon: LayoutGrid }],
  },
];

export function findActiveModule(pathname: string): ModuleDef | null {
  return dashboardModules.find((m) => m.items.some((item) => item.href === pathname)) ?? null;
}
