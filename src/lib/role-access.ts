import type { UserRole } from "./auth-api";

/** Which of the 5 dashboard-modules.ts module keys a role's nav/home should
 * show — missing role = every module (HR/legacy default). This is a UX
 * convenience only; the real access boundary is the backend's permission
 * classes, same as AuthGuard's per-path allowlist. */
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
