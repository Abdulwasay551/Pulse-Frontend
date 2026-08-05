"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Bell, ChevronDown, Lock, LogOut, Menu, Settings, Search } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { dashboardModules, featureHref, findActiveModuleForRoute, type ModuleDef } from "@/lib/dashboard-modules";
import { filterSectionsForRole, visibleModuleKeysFor } from "@/lib/role-access";
import type { UserRole } from "@/lib/auth-api";

// Placeholder preview data — Notifications isn't a real, working feature
// yet (there's no backend event stream behind it), so the dropdown shows
// blurred sample content with a "Coming soon" lock over it rather than
// pretending these are real, actionable notifications.
const MOCK_NOTIFICATIONS = [
  { id: 1, tone: "bg-primary", message: "Ava Thompson advanced to Interview for Senior Backend Engineer", time: "2h ago" },
  { id: 2, tone: "bg-amber", message: "Contractor batch #14 payroll needs review", time: "5h ago" },
  { id: 3, tone: "bg-primary", message: "Offer sent to Priya Nair for DevOps Lead", time: "1d ago" },
  { id: 4, tone: "bg-maroon", message: "Warranty expiring soon on EVO-LT-1055", time: "2d ago" },
];

/** One module's own trigger in the top navbar — the label navigates
 * straight to that module's hub, while the chevron opens a small dropdown
 * of just *that* module's sections/features (mirrors the Link+chevron
 * split used in Sidebar.tsx, so a single click target never has to both
 * navigate and toggle). Replaces the old single "Modules" mega-menu that
 * bundled all five modules behind one trigger. */
function ModuleNavItem({ moduleDef, isActive, role }: { moduleDef: ModuleDef; isActive: boolean; role: UserRole | undefined }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = moduleDef.icon;
  const visibleSections = filterSectionsForRole(moduleDef.sections, role);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div
        className={`flex items-center rounded-lg transition-colors ${
          isActive ? "bg-primary/10 text-primary" : "text-ink-soft hover:bg-cream-dim hover:text-ink"
        }`}
      >
        <Link
          href={moduleDef.overviewHref}
          title={moduleDef.label}
          className="flex items-center gap-1.5 rounded-l-lg py-2 pr-1 pl-2.5 text-[12.5px] font-medium whitespace-nowrap"
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="hidden xl:inline">{moduleDef.label}</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={`${moduleDef.label} sub-modules`}
          className="rounded-r-lg py-2 pr-2 pl-1"
        >
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 z-50 mt-2 max-h-[75vh] w-72 overflow-y-auto rounded-2xl border border-line bg-card p-3 shadow-xl">
          <div className="flex flex-col gap-3">
            {visibleSections.map((section) => (
              <div key={section.label}>
                {section.href ? (
                  <Link
                    href={section.href}
                    onClick={() => setOpen(false)}
                    className="block px-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-soft/70 transition-colors hover:text-primary"
                  >
                    {section.label}
                  </Link>
                ) : (
                  <div className="px-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wide text-ink-soft/70">
                    {section.label}
                  </div>
                )}
                <div className="flex flex-col gap-0.5">
                  {section.features.map((feature) => {
                    const href = featureHref(moduleDef, section, feature);
                    const FeatureIcon = feature.icon;
                    return (
                      <Link
                        key={href + feature.label}
                        href={href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[12.5px] text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink"
                      >
                        <FeatureIcon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{feature.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Topbar({
  onOpenSidebar,
  showMenuButton = true,
}: {
  onOpenSidebar: () => void;
  showMenuButton?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout: signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const activeModule = findActiveModuleForRoute(pathname, searchParams);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = user ? [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username : "";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");

  async function logout() {
    await signOut();
    router.push("/login");
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-line bg-card px-4 py-3.5 sm:px-6">
      {showMenuButton && (
        <button
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <nav className="hidden shrink-0 items-center gap-1 sm:flex">
        {dashboardModules
          .filter((m) => {
            const visibleKeys = visibleModuleKeysFor(user?.role);
            return !visibleKeys || visibleKeys.includes(m.key);
          })
          .map((m) => (
            <ModuleNavItem key={m.key} moduleDef={m} isActive={activeModule?.key === m.key} role={user?.role} />
          ))}
      </nav>

      {activeModule ? (
        <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-line bg-cream px-3 py-2 sm:flex">
          <Search className="h-4 w-4 shrink-0 text-ink-soft" />
          <input
            type="text"
            placeholder={activeModule.searchPlaceholder}
            className="w-full bg-transparent text-[13px] text-ink placeholder:text-ink-soft/70 focus:outline-none"
          />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-maroon" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
              <div className="border-b border-line px-3.5 py-3">
                <div className="text-[13px] font-semibold text-ink">Notifications</div>
              </div>

              <div className="relative">
                <div className="pointer-events-none flex select-none flex-col blur-[3px]">
                  {MOCK_NOTIFICATIONS.map((n) => (
                    <div key={n.id} className="flex items-start gap-2.5 border-b border-line px-3.5 py-3 last:border-0">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.tone}`} />
                      <p className="flex-1 text-[13px] text-ink">{n.message}</p>
                      <span className="shrink-0 text-[11px] text-ink-soft">{n.time}</span>
                    </div>
                  ))}
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-card/40">
                  <span className="flex items-center gap-1.5 rounded-full border border-line bg-card px-3.5 py-2 text-xs font-semibold text-ink shadow-md">
                    <Lock className="h-3.5 w-3.5 text-ink-soft" />
                    Coming soon
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-cream-dim"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-cream">
              {initials}
            </span>
            <span className="hidden text-[13px] font-medium text-ink sm:inline">
              {displayName}
            </span>
            <ChevronDown
              className={`hidden h-3.5 w-3.5 text-ink-soft transition-transform sm:block ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
              <div className="border-b border-line px-3.5 py-3">
                <div className="truncate text-[13px] font-semibold text-ink">{displayName}</div>
                <div className="truncate text-[11px] text-ink-soft">{user?.email}</div>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-ink transition-colors hover:bg-cream-dim"
              >
                <Settings className="h-[16px] w-[16px] text-ink-soft" />
                Settings
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-maroon transition-colors hover:bg-cream-dim"
              >
                <LogOut className="h-[16px] w-[16px]" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
