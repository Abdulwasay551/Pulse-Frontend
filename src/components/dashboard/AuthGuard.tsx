"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import BrandLoader from "@/components/site/BrandLoader";
import { useAuth } from "@/lib/auth-context";
import { ROLE_ALLOWED_PATHS } from "@/lib/role-access";

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
