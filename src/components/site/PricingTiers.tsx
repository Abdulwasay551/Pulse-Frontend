"use client";

import { useState } from "react";
import Link from "next/link";
import type { PricingTier } from "@/lib/cms";

export default function PricingTiers({ tiers }: { tiers: PricingTier[] }) {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      <div className="mb-12 flex items-center justify-center gap-4">
        <span className={`text-sm font-semibold ${!annual ? "text-ink" : "text-ink-soft"}`}>
          Monthly
        </span>
        <button
          aria-label="Toggle annual pricing"
          onClick={() => setAnnual((v) => !v)}
          className={`relative h-6 w-11 rounded-full transition-colors ${annual ? "bg-primary" : "bg-primary-dark"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-cream transition-transform ${annual ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
        <span className={`text-sm font-semibold ${annual ? "text-ink" : "text-ink-soft"}`}>
          Annual
        </span>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          Save 20%
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-stretch">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative flex flex-col rounded-2xl border p-8 ${
              tier.featured
                ? "border-primary bg-primary-dark shadow-2xl shadow-primary-dark/25"
                : "border-line bg-card"
            }`}
          >
            {tier.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-light px-3 py-1 text-[10.5px] font-bold tracking-wide text-primary-dark">
                MOST POPULAR
              </span>
            )}
            <h3
              className={`font-display text-xl font-bold ${tier.featured ? "text-cream" : "text-ink"}`}
            >
              {tier.name}
            </h3>
            <p className={`mt-1.5 text-sm ${tier.featured ? "text-cream/60" : "text-ink-soft"}`}>
              {tier.description}
            </p>

            <div className="mt-6">
              {!tier.is_custom ? (
                <>
                  <span
                    className={`text-4xl font-bold tabular-nums ${tier.featured ? "text-cream" : "text-ink"}`}
                  >
                    ${annual ? tier.annual_price : tier.monthly_price}
                  </span>
                  <span className={`text-sm ${tier.featured ? "text-cream/50" : "text-ink-soft"}`}>
                    {" "}
                    / recruiter / mo
                  </span>
                </>
              ) : (
                <span
                  className={`text-4xl font-bold ${tier.featured ? "text-cream" : "text-ink"}`}
                >
                  Custom
                </span>
              )}
              <div className={`mt-1 text-xs ${tier.featured ? "text-cream/40" : "text-ink-soft"}`}>
                {!tier.is_custom ? (annual ? "Billed annually" : "Billed monthly") : "Talk to sales"}
              </div>
            </div>

            <ul className="mt-7 mb-8 flex-1 space-y-3">
              {tier.features.map((f) => (
                <li
                  key={f}
                  className={`flex gap-2.5 text-sm ${tier.featured ? "text-cream/80" : "text-ink"}`}
                >
                  <span className={tier.featured ? "text-primary-light" : "text-primary"}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className={`rounded-lg px-5 py-3 text-center text-sm font-semibold transition-colors ${
                tier.featured
                  ? "bg-primary-light text-primary-dark hover:bg-cream"
                  : "bg-primary text-cream hover:bg-primary-dark"
              }`}
            >
              {tier.cta_label}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
