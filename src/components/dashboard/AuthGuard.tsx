"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import BrandLoader from "@/components/site/BrandLoader";
import { useAuth } from "@/lib/auth-context";

// Employee-role logins only ever get the self-service home (rendered by
// /dashboard itself, branching on role) and Settings — every module's full
// CRUD is HR-only both here and (as the real enforcement) on the backend
// via IsOwner/IsHR. This is just so a direct URL visit redirects home
// instead of hitting a raw 403 from the API.
const EMPLOYEE_ALLOWED_PATHS = ["/dashboard", "/dashboard/settings"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && user?.role === "Employee" && !EMPLOYEE_ALLOWED_PATHS.includes(pathname)) {
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
