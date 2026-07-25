"use client";

import Link from "next/link";
import { ArrowRight, Banknote, IdCard, Laptop, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

// Same five-color rotation the marketing solutions cards use (see
// ProductCards.tsx CARD_VARIANTS) — proven to read as distinct, energetic,
// and on-brand, and reused here so each module feels like its own product
// the moment you land on it, not a plain uniform tile.
const moduleVariants = [
  { card: "bg-primary-dark", badge: "bg-primary-light", icon: "text-cream", title: "text-cream", desc: "text-cream/60", cta: "text-primary-light" },
  { card: "bg-card border border-line", badge: "bg-primary", icon: "text-cream", title: "text-ink", desc: "text-ink-soft", cta: "text-primary" },
  { card: "bg-cream-dim border border-line", badge: "bg-primary-light", icon: "text-cream", title: "text-ink", desc: "text-ink-soft", cta: "text-primary" },
  { card: "bg-primary-light", badge: "bg-cream", icon: "text-primary-dark", title: "text-cream", desc: "text-cream/80", cta: "text-cream" },
  { card: "bg-primary-dark", badge: "bg-cream", icon: "text-primary-dark", title: "text-cream", desc: "text-cream/60", cta: "text-primary-light" },
];

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
    <div className="-m-4 sm:-m-6">
      <div
        className="relative overflow-hidden px-6 py-16 text-center sm:py-20"
        style={{
          backgroundImage: [
            "radial-gradient(circle at 15% 20%, rgba(77,111,224,0.35), transparent 45%)",
            "radial-gradient(circle at 85% 80%, rgba(185,134,31,0.18), transparent 45%)",
            "radial-gradient(rgba(255,255,255,0.06) 1.5px, transparent 1.5px)",
          ].join(", "),
          backgroundSize: "auto, auto, 22px 22px",
          backgroundColor: "var(--primary-dark)",
        }}
      >
        <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-wide text-primary-light uppercase">
          The EvoHR Suite
        </span>
        <h1 className="font-display text-3xl font-bold text-cream md:text-5xl">Welcome back, {firstName}</h1>
        <p className="mx-auto mt-4 max-w-lg text-cream/70 md:text-lg">
          Pick a module to get to work — every part of your business, in one place.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) => {
            const variant = moduleVariants[i % moduleVariants.length];
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`group relative flex h-full flex-col overflow-hidden rounded-3xl p-7 shadow-md shadow-ink/5 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl hover:shadow-ink/10 ${variant.card}`}
              >
                <span
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 ${variant.badge}`}
                >
                  <m.icon className={`h-6 w-6 ${variant.icon}`} />
                </span>
                <h2 className={`font-display text-lg font-bold ${variant.title}`}>{m.title}</h2>
                <p className={`mt-2 text-sm leading-relaxed ${variant.desc}`}>{m.description}</p>
                <span className={`mt-auto flex w-fit items-center gap-1.5 pt-5 font-mono text-xs font-semibold ${variant.cta}`}>
                  Open module
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
