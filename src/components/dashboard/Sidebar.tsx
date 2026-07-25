"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronsLeft, ChevronsRight, X } from "lucide-react";
import Logo from "@/components/site/Logo";
import { useAuth } from "@/lib/auth-context";
import { findActiveModule } from "@/lib/dashboard-modules";

export default function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const displayName = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username : "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  useEffect(() => {
    const stored = localStorage.getItem("evohr_sidebar_collapsed");
    if (stored === "true") requestAnimationFrame(() => setCollapsed(true));
  }, []);

  function toggle() {
    setCollapsed((v) => {
      localStorage.setItem("evohr_sidebar_collapsed", String(!v));
      return !v;
    });
  }

  const activeModule = findActiveModule(pathname);
  // No module context (the hub page, Settings) — no sidebar at all.
  if (!activeModule) return null;

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-cream/10 bg-primary-dark transition-transform duration-300 ease-in-out lg:static lg:transition-[width] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${collapsed ? "lg:w-[76px]" : "lg:w-64"}`}
      >
        <div className="flex items-center gap-2 px-4 py-5">
          <Logo className="h-8 w-8 shrink-0" />
          {!collapsed && (
            <span className="font-display text-lg font-bold whitespace-nowrap text-cream">
              EvoHR
            </span>
          )}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto rounded-lg p-1.5 text-cream/60 hover:bg-cream/5 hover:text-cream lg:hidden"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="px-3 pb-2">
          <Link
            href="/dashboard"
            onClick={onClose}
            title={collapsed ? "All modules" : undefined}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-[12px] text-cream/50 transition-colors hover:bg-cream/5 hover:text-cream"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>All modules</span>}
          </Link>
        </div>

        {!collapsed && (
          <div className="px-4 pb-2 font-mono text-[11px] font-semibold uppercase tracking-wide text-cream/40">
            {activeModule.label}
          </div>
        )}

        <nav className="flex-1 space-y-1 px-3">
          {activeModule.items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 font-mono text-[13px] transition-colors ${
                  active
                    ? "bg-primary-light/15 text-primary-light"
                    : "text-cream/60 hover:bg-cream/5 hover:text-cream"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

      <div className="border-t border-cream/10 p-3">
        <div className={`flex items-center gap-2.5 rounded-lg px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light/20 font-mono text-xs font-bold text-primary-light">
            {initials}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-cream">{displayName}</div>
              <div className="truncate font-mono text-[11px] text-cream/45">{user?.username}</div>
            </div>
          )}
        </div>
        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`mt-1 hidden w-full items-center gap-3 rounded-lg px-3 py-2 font-mono text-[13px] text-cream/50 transition-colors hover:bg-cream/5 hover:text-cream lg:flex ${
            collapsed ? "justify-center" : ""
          }`}
        >
          {collapsed ? (
            <ChevronsRight className="h-[16px] w-[16px] shrink-0" />
          ) : (
            <>
              <ChevronsLeft className="h-[16px] w-[16px] shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
      </aside>
    </>
  );
}
