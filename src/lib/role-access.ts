import type { UserRole } from "./auth-api";
import { dashboardModules, hrefPathname, type ModuleDef, type ModuleFeatureSection } from "./dashboard-modules";

/** True if `allowed` (a role's ROLE_ALLOWED_PATHS list) reaches at least one
 * page anywhere inside `moduleDef` — its own hub, an extra link, a
 * section's own sub-hub, or any feature leaf. A module the matrix gives a
 * role zero rows in (e.g. Recruiter in Payroll & Benefits, IT Manager in
 * Talent Management) won't match anything here. */
function moduleHasAnyAllowedPath(moduleDef: ModuleDef, allowed: string[]): boolean {
  if (allowed.includes(hrefPathname(moduleDef.overviewHref))) return true;
  if (moduleDef.extraLinks.some((l) => allowed.includes(hrefPathname(l.href)))) return true;
  return moduleDef.sections.some(
    (s) =>
      (s.href && allowed.includes(hrefPathname(s.href))) ||
      s.features.some((f) => f.href && allowed.includes(hrefPathname(f.href)))
  );
}

/** Which of the 5 modules a role should even see a tile for. The Control
 * Hierarchy Matrix rollout replaced "hide the whole module" with "show
 * every module, filter which *sub-features* are reachable inside it" —
 * but that only holds when the role has *some* reachable page in the
 * module at all. A role with zero matrix rows anywhere in a module (e.g.
 * Recruiter has no Payroll & Benefits or IT & Asset Management access
 * whatsoever) would otherwise get a tile that 404s/redirects on click, so
 * this computes real per-role visibility from ROLE_ALLOWED_PATHS instead
 * of a hardcoded list — a role missing from that map (HR, Auditor,
 * legacy) is unrestricted and sees every module, same as always. */
export function visibleModuleKeysFor(role: UserRole | undefined): string[] | null {
  const allowed = role ? ROLE_ALLOWED_PATHS[role] : undefined;
  if (!allowed) return null;
  return dashboardModules.filter((m) => moduleHasAnyAllowedPath(m, allowed)).map((m) => m.key);
}

/** Roles that get a narrower, module-grid dashboard home instead of the
 * full HR admin home or Employee's self-service one. Auditor lands here
 * too — "read-everywhere" doesn't need HR's admin quick-actions (add
 * users, org settings), and the actual read-only enforcement is the
 * backend's matrix permissions (Auditor can navigate anywhere in
 * ROLE_ALLOWED_PATHS below since it's deliberately absent from that map,
 * same as HR — writes 403 server-side regardless of what the UI shows).
 * Contractor is handled separately in dashboard/page.tsx (routes through
 * EmployeeHome, same as Employee — see the comment there). */
export const NARROW_ROLES: UserRole[] = ["IT Manager", "Finance Admin", "Department Head", "Recruiter", "Auditor"];

// Every narrower role only ever gets a hand-picked slice of routes plus
// Settings — every module's full CRUD is HR-only both here and (as the
// real enforcement) on the backend via IsOwner/IsHR and the per-role
// permission classes. A role missing from this map (HR, and any legacy/
// superuser account reading as HR) is unrestricted. Single source of
// truth — consumed by AuthGuard (route redirects) and by the nav filters
// below (Sidebar, Topbar's module dropdown, module hub pages), so a page
// is never reachable from the nav without also being an allowed route,
// and vice versa.
// Employee/Contractor's slice, straight off the Control Hierarchy Matrix
// (see backend core/access_matrix.py + each module's views.py for the
// real enforcement — this list exists so the nav/sidebar don't show a
// link that would just 403 once clicked). Every module's own top-level
// hub (`/dashboard/{module}`) is included for both roles regardless of
// what the matrix's module-level "Overview" row says, so the module
// itself always stays reachable/visible per-role differences are about
// which *sub-features* show up inside it, not whether the module exists
// in their nav at all; a hub page whose own aggregate summary the matrix
// denies them just renders without that summary (each hub already
// handles its stats call failing/being unavailable gracefully).
const EMPLOYEE_MATRIX_PATHS = [
  "/dashboard",
  "/dashboard/settings",
  "/dashboard/coming-soon",
  // Recruit — Onboarding only (an active employee has no reason to see
  // Offboarding, which the matrix denies EMP entirely) + their own
  // background-check consent status.
  "/dashboard/recruit",
  "/dashboard/onboarding",
  "/dashboard/background-checks",
  // People Management — full self-service slice.
  "/dashboard/people",
  "/dashboard/attendance-management",
  "/dashboard/attendance",
  "/dashboard/shift-scheduling",
  "/dashboard/leave-requests",
  "/dashboard/employee-engagement",
  "/dashboard/surveys",
  "/dashboard/recognition",
  "/dashboard/promotions",
  "/dashboard/employee-records",
  "/dashboard/employee-database",
  "/dashboard/org-chart",
  // Talent Management.
  "/dashboard/talent",
  "/dashboard/goals-appraisal",
  "/dashboard/goals",
  "/dashboard/appraisals",
  "/dashboard/competency-mapping",
  "/dashboard/learning-growth",
  "/dashboard/learning",
  "/dashboard/career-paths",
  // Payroll & Benefits — own payslips/direct deposit/benefits/claims only.
  "/dashboard/payroll-benefits",
  "/dashboard/payroll-overview",
  "/dashboard/payroll",
  "/dashboard/direct-deposit",
  "/dashboard/benefits-overview",
  "/dashboard/benefits-enrollment",
  "/dashboard/claims",
  // IT & Asset Management — own devices/tickets/BYOD status only.
  "/dashboard/it-assets",
  "/dashboard/device-provisioning",
  "/dashboard/asset-inventory",
  "/dashboard/device-tracker",
  "/dashboard/it-support",
  "/dashboard/byod-policy",
];

export const ROLE_ALLOWED_PATHS: Partial<Record<UserRole, string[]>> = {
  Employee: EMPLOYEE_MATRIX_PATHS,
  // Contractor mirrors Employee almost exactly (it's explicitly "a
  // restricted Employee variant") minus the couple of rows the matrix
  // denies Contractor specifically: Promotion & Transfer Workflows
  // ('-' vs Employee's R*) and Pulse Checks (folded into the same Surveys
  // page/model as regular surveys on the frontend, so — unlike the
  // backend, which can gate the underlying SurveyResponse write per
  // `survey.kind` — this can't be split at the page-route level; kept
  // reachable for both roles, same approximation the backend agent noted).
  Contractor: EMPLOYEE_MATRIX_PATHS.filter((p) => p !== "/dashboard/promotions"),
  // IT Admin (ITA): full control across IT & Asset Management (unchanged),
  // plus the matrix's real partial grants elsewhere — Onboarding's Portal
  // Access/Device Assignment tasks and Offboarding's Access Status/Hardware
  // Clearance tasks (ITA=RWA on those rows specifically, everything else in
  // Recruit is '-'), and read-only on People's Employee Database (the
  // "Company Property" sub-tab links back to IT & Asset Mgmt). Recruit and
  // People's *module* hubs are included so those pages are actually
  // reachable — Talent Management and Payroll & Benefits get zero rows
  // anywhere in the matrix for ITA, so they're deliberately absent here and
  // get hidden entirely by visibleModuleKeysFor instead of 404ing on click.
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
    "/dashboard/recruit",
    "/dashboard/onboarding",
    "/dashboard/offboarding",
    "/dashboard/people",
    "/dashboard/employee-records",
    "/dashboard/employee-database",
  ],
  // Finance Admin (FA): full control across Payroll & Benefits (unchanged),
  // plus "read access to comp-adjacent data elsewhere" per its role
  // definition — Recruit's Recruiting Dashboard/Client/Job Openings/Offer
  // Letters (comp terms) and Offboarding's Hardware Clearance (asset
  // write-off impact); People's Overtime/Time Off/Promotions (payroll cost
  // impact) and Employee Database; IT & Asset's Overview/Device
  // Provisioning/Asset Inventory/Warranty Tracking (read) and Device
  // Tracker (its one write exception in that module). Talent Management
  // gets zero rows anywhere for FA, so it's absent and hidden entirely.
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
    "/dashboard/recruit",
    "/dashboard/acquisition",
    "/dashboard/clients",
    "/dashboard/requisitions",
    "/dashboard/offer-letters",
    "/dashboard/offboarding",
    "/dashboard/people",
    "/dashboard/attendance-management",
    "/dashboard/attendance",
    "/dashboard/leave-requests",
    "/dashboard/employee-engagement",
    "/dashboard/promotions",
    "/dashboard/employee-records",
    "/dashboard/employee-database",
    "/dashboard/it-assets",
    "/dashboard/assets-management",
    "/dashboard/device-provisioning",
    "/dashboard/asset-inventory",
    "/dashboard/warranty-tracking",
    "/dashboard/device-tracker",
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
  // Recruiter (REC): full Recruit access (unchanged) plus its two real
  // partial grants elsewhere — People's Employee Database & Org Chart
  // (both 'R', to see who's already on staff) and Talent's Recruiter
  // Feedback ('RW', notes left on a placed candidate post-hire). Payroll &
  // Benefits and IT & Asset Management get zero rows anywhere for REC, so
  // they're deliberately absent here and hidden entirely rather than
  // showing a tile that redirects on click.
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
    "/dashboard/people",
    "/dashboard/employee-records",
    "/dashboard/employee-database",
    "/dashboard/org-chart",
    "/dashboard/talent",
    "/dashboard/goals-appraisal",
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
