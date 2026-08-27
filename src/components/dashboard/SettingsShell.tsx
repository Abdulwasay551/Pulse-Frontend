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
// switching between them is one click, not a trip back through the
// General page's link cards each time.
export default function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
      <nav className="shrink-0 lg:w-56">
        <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors lg:whitespace-normal ${
                  active ? "bg-primary text-cream" : "text-ink-soft hover:bg-card hover:text-ink"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
