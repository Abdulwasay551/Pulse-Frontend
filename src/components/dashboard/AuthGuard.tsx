"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import BrandLoader from "@/components/site/BrandLoader";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/auth-api";

// Every narrower role only ever gets a hand-picked slice of routes plus
// Settings — every module's full CRUD is HR-only both here and (as the
// real enforcement) on the backend via IsOwner/IsHR and the per-role
// permission classes. This is just so a direct URL visit redirects home
// instead of hitting a raw 403 from the API. A role missing from this map
// (HR, and any legacy/superuser account reading as HR) is unrestricted.
const ROLE_ALLOWED_PATHS: Partial<Record<UserRole, string[]>> = {
  Employee: ["/dashboard", "/dashboard/settings"],
  "IT Manager": [
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/it-assets",
    "/dashboard/device-provisioning",
    "/dashboard/asset-inventory",
    "/dashboard/warranty-tracking",
    "/dashboard/it-support",
    "/dashboard/device-tracker",
    "/dashboard/byod-policy",
    "/dashboard/onboarding",
    "/dashboard/offboarding",
  ],
  "Finance Admin": [
    "/dashboard",
    "/dashboard/settings",
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
    "/dashboard/attendance-management",
  ],
  "Department Head": [
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/recruit",
    "/dashboard/acquisition",
    "/dashboard/requisitions",
    "/dashboard/people",
    "/dashboard/employee-records",
    "/dashboard/employee-database",
    "/dashboard/attendance-management",
    "/dashboard/attendance",
    "/dashboard/leave-requests",
    "/dashboard/employee-engagement",
    "/dashboard/promotions",
    "/dashboard/recognition",
    "/dashboard/workforce-dashboard",
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
    "/dashboard/it-support",
    "/dashboard/device-tracker",
  ],
  Recruiter: [
    "/dashboard",
    "/dashboard/settings",
    "/dashboard/recruit",
    "/dashboard/acquisition",
    "/dashboard/clients",
    "/dashboard/requisitions",
    "/dashboard/candidates",
    "/dashboard/resume-pool",
    "/dashboard/offer-letters",
    "/dashboard/background-checks",
    "/dashboard/ai-resume-screening",
    "/dashboard/candidate-portal",
    "/dashboard/onboarding",
    "/dashboard/offboarding",
    "/dashboard/rehire-pool",
    "/dashboard/analytics",
    "/dashboard/recruiter-feedback",
  ],
};

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    const allowedPaths = user?.role ? ROLE_ALLOWED_PATHS[user.role] : undefined;
    if (status === "authenticated" && allowedPaths && !allowedPaths.includes(pathname)) {
      router.replace("/dashboard");
    }
  }, [status, user, pathname, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <BrandLoader label="Checking session" />
      </div>
    );
  }

  return <>{children}</>;
}
