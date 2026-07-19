"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Settings, Search } from "lucide-react";
import { demoUser } from "@/lib/dashboard-data";

export default function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function logout() {
    localStorage.removeItem("evohr_demo_session");
    window.location.href = "/login";
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-line bg-card px-4 py-3.5 sm:px-6">
      <button
        onClick={onOpenSidebar}
        aria-label="Open menu"
        className="rounded-lg p-2 text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-line bg-cream px-3 py-2 sm:flex">
        <Search className="h-4 w-4 shrink-0 text-ink-soft" />
        <input
          type="text"
          placeholder="Search candidates, clients, requisitions…"
          className="w-full bg-transparent font-mono text-[13px] text-ink placeholder:text-ink-soft/70 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-maroon" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors hover:bg-cream-dim"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-cream">
              {demoUser.initials}
            </span>
            <span className="hidden font-mono text-[13px] font-medium text-ink sm:inline">
              {demoUser.name}
            </span>
            <ChevronDown
              className={`hidden h-3.5 w-3.5 text-ink-soft transition-transform sm:block ${menuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
              <div className="border-b border-line px-3.5 py-3">
                <div className="truncate text-[13px] font-semibold text-ink">{demoUser.name}</div>
                <div className="truncate font-mono text-[11px] text-ink-soft">{demoUser.email}</div>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 font-mono text-[13px] text-ink transition-colors hover:bg-cream-dim"
              >
                <Settings className="h-[16px] w-[16px] text-ink-soft" />
                Settings
              </Link>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 font-mono text-[13px] text-maroon transition-colors hover:bg-cream-dim"
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
