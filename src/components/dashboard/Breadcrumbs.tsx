"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { getBreadcrumbTrail } from "@/lib/dashboard-modules";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname === "/dashboard") return null;

  const trail = getBreadcrumbTrail(pathname, searchParams);
  if (trail.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 overflow-x-auto border-b border-line bg-card px-4 py-2.5 text-xs whitespace-nowrap text-ink-soft sm:px-6"
    >
      <Link href="/dashboard" aria-label="Dashboard home" className="flex shrink-0 items-center transition-colors hover:text-ink">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {trail.map((crumb, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={`${crumb.label}-${i}`} className="flex shrink-0 items-center gap-1.5">
            <ChevronRight className="h-3 w-3 shrink-0 text-ink-soft/50" />
            {crumb.href && !isLast ? (
              <Link href={crumb.href} className="transition-colors hover:text-ink">
                {crumb.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-ink" : ""}>{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
