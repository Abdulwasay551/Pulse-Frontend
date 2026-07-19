"use client";

import Link from "next/link";
import { useState } from "react";
import Logo from "./Logo";

const navLinks = [
  { label: "Solutions", href: "/solutions" },
  { label: "Use cases", href: "/use-cases" },
  { label: "Who we serve", href: "/who-we-serve" },
  { label: "Resources", href: "/resources" },
  { label: "Pricing", href: "/pricing" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <Logo />
          EvoHR
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-mono text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-lg border border-line px-4 py-2 font-mono text-[13px] font-semibold text-ink transition-colors hover:bg-cream-dim"
          >
            Log in
          </Link>
          <a
            href="#demo"
            className="rounded-lg bg-primary px-4 py-2 font-mono text-[13px] font-semibold text-cream transition-colors hover:bg-primary-dark"
          >
            Book a Demo
          </a>
        </div>

        <button
          aria-label="Toggle menu"
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-ink" />
          <span className="block h-0.5 w-6 bg-ink" />
          <span className="block h-0.5 w-6 bg-ink" />
        </button>
      </nav>

      {open && (
        <div className="flex flex-col gap-4 border-t border-line bg-cream px-6 py-6 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-mono text-[13px] font-medium text-ink-soft"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-line px-4 py-2 text-center font-mono text-[13px] font-semibold text-ink"
              onClick={() => setOpen(false)}
            >
              Log in
            </Link>
            <a
              href="#demo"
              className="rounded-lg bg-primary px-4 py-2 text-center font-mono text-[13px] font-semibold text-cream"
            >
              Book a Demo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
