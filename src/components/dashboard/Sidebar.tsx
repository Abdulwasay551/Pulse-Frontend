"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronsLeft, ChevronsRight, LayoutGrid, X } from "lucide-react";
import Logo from "@/components/site/Logo";
import { useAuth } from "@/lib/auth-context";
import { featureHref, findActiveModule, type ModuleDef } from "@/lib/dashboard-modules";

function sectionContainsPathname(moduleDef: ModuleDef, pathname: string) {
  return moduleDef.sections.find((s) => s.features.some((f) => f.href === pathname))?.label ?? null;
}

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
  const activeModule = findActiveModule(pathname);
  const activeSectionLabel = activeModule ? sectionContainsPathname(activeModule, pathname) : null;
  // Only tracks the user's manual toggles — the section containing the
  // current route is derived (and always shown open) below, rather than
  // synced here via an effect.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  function toggleSection(label: string) {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  }

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
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] text-cream/50 transition-colors hover:bg-cream/5 hover:text-cream"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            {!collapsed && <span>All modules</span>}
          </Link>
        </div>

        {!collapsed && (
          <div className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-wide text-cream/40">
            {activeModule.label}
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-3">
          <SidebarLink
            href={activeModule.overviewHref}
            label="Overview"
            icon={LayoutGrid}
            active={pathname === activeModule.overviewHref}
            collapsed={collapsed}
            onClick={onClose}
          />

          {activeModule.extraLinks.map((link) => (
            <SidebarLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={pathname === link.href}
              collapsed={collapsed}
              onClick={onClose}
            />
          ))}

          {activeModule.sections.map((section) => {
            // A section with only one feature is just that feature — skip
            // the collapsible chrome and render it as a single flat link.
            if (section.features.length === 1) {
              const feature = section.features[0];
              const href = featureHref(activeModule, section, feature);
              return (
                <SidebarLink
                  key={section.label}
                  href={href}
                  label={section.label}
                  icon={section.icon}
                  active={pathname === href}
                  collapsed={collapsed}
                  onClick={onClose}
                />
              );
            }

            if (collapsed) {
              return section.features.map((feature) => {
                const href = featureHref(activeModule, section, feature);
                return (
                  <SidebarLink
                    key={href + feature.label}
                    href={href}
                    label={feature.label}
                    icon={feature.icon}
                    active={pathname === href}
                    collapsed={collapsed}
                    onClick={onClose}
                  />
                );
              });
            }

            const isOpen = expanded[section.label] ?? section.label === activeSectionLabel;
            const SectionIcon = section.icon;
            return (
              <div key={section.label}>
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-cream/60 transition-colors hover:bg-cream/5 hover:text-cream"
                >
                  <SectionIcon className="h-[18px] w-[18px] shrink-0" />
                  <span className="flex-1 truncate text-left">{section.label}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="mt-0.5 mb-1 ml-4 flex flex-col gap-0.5 border-l border-cream/10 pl-3">
                    {section.features.map((feature) => {
                      const href = featureHref(activeModule, section, feature);
                      const active = pathname === href;
                      const Icon = feature.icon;
                      return (
                        <Link
                          key={href + feature.label}
                          href={href}
                          onClick={onClose}
                          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12.5px] transition-colors ${
                            active
                              ? "bg-primary-light/15 text-primary-light"
                              : "text-cream/55 hover:bg-cream/5 hover:text-cream"
                          }`}
                        >
                          <Icon className="h-[15px] w-[15px] shrink-0" />
                          <span className="truncate">{feature.label}</span>
                          {!feature.href && (
                            <span className="ml-auto shrink-0 rounded-full bg-cream/10 px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap text-cream/50">
                              Soon
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

      <div className="border-t border-cream/10 p-3">
        <div className={`flex items-center gap-2.5 rounded-lg px-2 py-2 ${collapsed ? "justify-center" : ""}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light/20 text-xs font-bold text-primary-light">
            {initials}
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-cream">{displayName}</div>
              <div className="truncate text-[11px] text-cream/45">{user?.username}</div>
            </div>
          )}
        </div>
        <button
          onClick={toggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`mt-1 hidden w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-cream/50 transition-colors hover:bg-cream/5 hover:text-cream lg:flex ${
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

function SidebarLink({
  href,
  label,
  icon: Icon,
  active,
  collapsed,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors ${
        active ? "bg-primary-light/15 text-primary-light" : "text-cream/60 hover:bg-cream/5 hover:text-cream"
      }`}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}
