"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyRound, Plug, Sparkles, UserRound } from "lucide-react";

const NAV = [
  { href: "/dashboard/settings", label: "General", icon: UserRound },
  { href: "/dashboard/settings/ai", label: "AI Integrations", icon: Sparkles },
  { href: "/dashboard/settings/integrations", label: "Integrations", icon: Plug },
  { href: "/dashboard/settings/api-tokens", label: "API Access", icon: KeyRound },
];

// Shared two-column shell for every Settings page — General, AI
// Integrations, Integrations, and API Access all render inside this so
// switching between them is one click. The nav column is styled and
// positioned like the app's main module Sidebar (dark, flush against the
// true left edge, full height) rather than floating inside the padded
// content area — DashboardShell strips <main>'s padding for settings
// routes specifically so this can reach the edge the same way the module
// Sidebar does.
export default function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0">
      <nav className="hidden w-64 shrink-0 flex-col overflow-y-auto border-r border-cream/10 bg-primary-dark py-5 lg:flex">
        <div className="px-4 pb-3 text-[11px] font-semibold tracking-wide text-cream/40 uppercase">Settings</div>
        <div className="flex flex-col gap-0.5 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  active ? "bg-cream/10 text-cream" : "text-cream/60 hover:bg-cream/5 hover:text-cream"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="flex w-full flex-col overflow-y-auto lg:min-w-0">
        <div className="flex gap-1.5 overflow-x-auto border-b border-line bg-card px-4 py-2.5 lg:hidden">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  active ? "bg-primary text-cream" : "text-ink-soft hover:bg-cream-dim hover:text-ink"
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
