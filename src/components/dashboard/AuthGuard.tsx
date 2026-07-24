"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import BrandLoader from "@/components/site/BrandLoader";
import { useAuth } from "@/lib/auth-context";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <BrandLoader label="Checking session" />
      </div>
    );
  }

  return <>{children}</>;
}
