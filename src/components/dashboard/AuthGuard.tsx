"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BrandLoader from "@/components/site/BrandLoader";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("evohr_demo_session") === "true") {
      requestAnimationFrame(() => setAuthorized(true));
    } else {
      router.replace("/login");
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <BrandLoader label="Checking session" />
      </div>
    );
  }

  return <>{children}</>;
}
