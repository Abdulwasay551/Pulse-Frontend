import type { UserRole } from "./auth-api";
import { hrefPathname, type ModuleFeatureSection } from "./dashboard-modules";

/** Which of the 5 dashboard-modules.ts module keys a role's nav/home should
 * show — missing role = every module (HR/legacy default). This is a UX
 * convenience only; the real access boundary is the backend's permission
 * classes, same as ROLE_ALLOWED_PATHS below. */
export const ROLE_VISIBLE_MODULE_KEYS: Partial<Record<UserRole, string[]>> = {
  Employee: [],
  "IT Manager": ["it-assets"],
  "Finance Admin": ["payroll-benefits"],
  Recruiter: ["recruit"],
  "Department Head": ["recruit", "people", "talent", "payroll-benefits", "it-assets"],
};

export function visibleModuleKeysFor(role: UserRole | undefined): string[] | null {
  if (!role) return null;
  return ROLE_VISIBLE_MODULE_KEYS[role] ?? null;
}

/** The 4 new roles that get a narrower, module-filtered dashboard home
 * instead of the full "all modules" HR home. */
export const NARROW_ROLES: UserRole[] = ["IT Manager", "Finance Admin", "Department Head", "Recruiter"];

// Every narrower role only ever gets a hand-picked slice of routes plus
// Settings — every module's full CRUD is HR-only both here and (as the
// real enforcement) on the backend via IsOwner/IsHR and the per-role
// permission classes. A role missing from this map (HR, and any legacy/
// superuser account reading as HR) is unrestricted. Single source of
// truth — consumed by AuthGuard (route redirects) and by the nav filters
// below (Sidebar, Topbar's module dropdown, module hub pages), so a page
// is never reachable from the nav without also being an allowed route,
// and vice versa.
export const ROLE_ALLOWED_PATHS: Partial<Record<UserRole, string[]>> = {
  Employee: ["/dashboard", "/dashboard/settings"],
  "IT Manager": [
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/coming-soon",
    "/dashboard/it-assets",
    "/dashboard/assets-management",
    "/dashboard/it-management",
    "/dashboard/device-provisioning",
    "/dashboard/asset-inventory",
    "/dashboard/warranty-tracking",
    "/dashboard/it-support",
    "/dashboard/device-tracker",
    "/dashboard/byod-policy",
    "/dashboard/asset-recovery",
    "/dashboard/onboarding",
    "/dashboard/offboarding",
  ],
  "Finance Admin": [
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/coming-soon",
    "/dashboard/payroll-benefits",
    "/dashboard/payroll-overview",
    "/dashboard/payroll",
    "/dashboard/tax-compliance",
    "/dashboard/compliance-calendar",
    "/dashboard/direct-deposit",
    "/dashboard/payroll-audit",
    "/dashboard/benefits-overview",
    "/dashboard/benefits-enrollment",
    "/dashboard/claims",
    "/dashboard/benefit-cost-analysis",
    "/dashboard/attendance",
  ],
  "Department Head": [
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/coming-soon",
    "/dashboard/recruit",
    "/dashboard/requisitions",
    "/dashboard/people",
    "/dashboard/employee-records",
    "/dashboard/employee-database",
    "/dashboard/attendance-management",
    "/dashboard/attendance",
    "/dashboard/shift-scheduling",
    "/dashboard/leave-requests",
    "/dashboard/employee-engagement",
    "/dashboard/promotions",
    "/dashboard/recognition",
    "/dashboard/talent",
    "/dashboard/goals-appraisal",
    "/dashboard/goals",
    "/dashboard/appraisals",
    "/dashboard/competency-mapping",
    "/dashboard/learning-growth",
    "/dashboard/career-paths",
    "/dashboard/succession-planning",
    "/dashboard/payroll-benefits",
    "/dashboard/benefits-overview",
    "/dashboard/benefits-enrollment",
    "/dashboard/claims",
    "/dashboard/it-assets",
    "/dashboard/assets-management",
    "/dashboard/it-management",
    "/dashboard/it-support",
    "/dashboard/device-tracker",
  ],
  Recruiter: [
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/coming-soon",
    "/dashboard/recruit",
    "/dashboard/acquisition",
    "/dashboard/clients",
    "/dashboard/requisitions",
    "/dashboard/candidates",
    "/dashboard/resume-pool",
    "/dashboard/offer-letters",
    "/dashboard/background-checks",
    "/dashboard/ai-resume-screening",
    "/dashboard/onboarding",
    "/dashboard/offboarding",
    "/dashboard/rehire-pool",
    "/dashboard/analytics",
    "/dashboard/recruiter-feedback",
  ],
};

/** True if `path` (a bare pathname, no query string) is reachable by
 * `role` — undefined/missing-from-map role = unrestricted (HR/Admin). */
export function isPathAllowedForRole(path: string, role: UserRole | undefined): boolean {
  if (!role) return true;
  const allowed = ROLE_ALLOWED_PATHS[role];
  return !allowed || allowed.includes(path);
}

/** Filters a module's sections/features down to only what `role` can
 * actually reach, dropping any section left with zero visible features.
 * Used everywhere the full section/feature tree would otherwise render
 * unconditionally (Sidebar, Topbar's per-module dropdown, module hub
 * pages) — keeps the nav honest with ROLE_ALLOWED_PATHS instead of
 * showing links that only 403 or redirect home once clicked. */
export function filterSectionsForRole(
  sections: ModuleFeatureSection[],
  role: UserRole | undefined
): ModuleFeatureSection[] {
  const allowed = role ? ROLE_ALLOWED_PATHS[role] : undefined;
  if (!allowed) return sections;
  return sections
    .map((section) => ({
      ...section,
      features: section.features.filter((f) => !f.href || allowed.includes(hrefPathname(f.href))),
    }))
    .filter((section) => section.features.length > 0);
}
