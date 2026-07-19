"use client";

import { useState } from "react";
import type { PricingTier } from "@/lib/cms";

export default function PricingCalculator({ tiers }: { tiers: PricingTier[] }) {
  const [recruiters, setRecruiters] = useState(10);
  const [annual, setAnnual] = useState(false);

  return (
    <div className="rounded-2xl border border-line bg-card p-7 md:p-9">
      <div className="mx-auto max-w-xl text-center">
        <div className="mb-2 font-mono text-xs uppercase tracking-wide text-primary">
          Cost calculator
        </div>
        <h3 className="font-display text-2xl font-bold text-ink">
          How much would EvoHR cost your desk?
        </h3>
      </div>

      <div className="mx-auto mt-8 max-w-xl">
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor="recruiter-count" className="font-mono text-sm text-ink-soft">
            Number of recruiters
          </label>
          <span className="font-mono text-2xl font-bold tabular-nums text-ink">{recruiters}</span>
        </div>
        <input
          id="recruiter-count"
          type="range"
          min={1}
          max={100}
          value={recruiters}
          onChange={(e) => setRecruiters(Number(e.target.value))}
          className="w-full accent-primary"
        />

        <div className="mt-6 flex items-center justify-center gap-3">
          <span className={`font-mono text-sm font-semibold ${!annual ? "text-ink" : "text-ink-soft"}`}>
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
          <span className={`font-mono text-sm font-semibold ${annual ? "text-ink" : "text-ink-soft"}`}>
            Annual
          </span>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {tiers.map((tier) => {
          const perSeat = annual ? tier.annual_price : tier.monthly_price;
          const total = perSeat != null ? perSeat * recruiters : null;

          return (
            <div
              key={tier.name}
              className={`rounded-xl border p-5 text-center ${
                tier.featured ? "border-primary bg-primary/5" : "border-line"
              }`}
            >
              <div className="font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {tier.name}
              </div>
              {tier.is_custom || total === null ? (
                <div className="mt-2 font-display text-xl font-bold text-ink">Custom</div>
              ) : (
                <>
                  <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-ink">
                    ${total.toLocaleString()}
                  </div>
                  <div className="font-mono text-[11px] text-ink-soft">
                    {annual ? "per month, billed annually" : "per month"}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
