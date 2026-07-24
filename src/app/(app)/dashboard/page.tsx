"use client";

import Link from "next/link";
import { ArrowRight, Banknote, IdCard, Laptop, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const modules = [
  {
    href: "/dashboard/recruit",
    icon: Users,
    title: "EVO-Recruit",
    description:
      "Applicant tracking, offer letters, job requisitions, onboarding, offboarding, and rehire — your full hiring lifecycle.",
  },
  {
    href: "/dashboard/people",
    icon: IdCard,
    title: "EVO-People Management",
    description: "Employee records, org chart, self-service, engagement, and attendance — HR core.",
  },
  {
    href: "/dashboard/talent",
    icon: TrendingUp,
    title: "EVO-Talent Management",
    description: "Goals & appraisals, learning paths, competency mapping, and succession planning.",
  },
  {
    href: "/dashboard/payroll-benefits",
    icon: Banknote,
    title: "EVO-Payroll & Benefits",
    description: "Payroll processing, multi-country compliance, benefits enrollment, and claims.",
  },
  {
    href: "/dashboard/it-assets",
    icon: Laptop,
    title: "EVO-IT & Asset Management",
    description: "Device provisioning, asset inventory, warranty tracking, and IT support tickets.",
  },
];

export default function DashboardHubPage() {
  const { user } = useAuth();
  const firstName = (user ? [user.first_name].filter(Boolean).join(" ") || user.username : "") || "there";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 rounded-3xl border border-line bg-card p-10 text-center">
        <span className="mb-3 inline-block font-mono text-xs font-semibold uppercase tracking-wide text-primary">
          The EvoHR Suite
        </span>
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">Welcome back, {firstName}</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-soft">
          Pick a module to get to work — every part of your business, in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-2xl border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          >
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <m.icon className="h-6 w-6" />
            </span>
            <h2 className="font-display text-lg font-bold text-ink">{m.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{m.description}</p>
            <span className="mt-4 flex items-center gap-1.5 font-mono text-xs font-semibold text-primary">
              Open module
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
