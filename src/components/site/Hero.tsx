import Link from "next/link";
import HeroDashboard from "./HeroDashboard";
import { sv, type HomePageData } from "@/lib/cms";

export default function Hero({ data }: { data: HomePageData }) {
  return (
    <section className="relative overflow-hidden px-6 pt-16 pb-20 md:pt-20 md:pb-28">
      <div
        aria-hidden="true"
        className="animate-drift-a pointer-events-none absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full bg-primary-light/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="animate-drift-b pointer-events-none absolute -bottom-32 -left-20 h-[380px] w-[380px] rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(var(--line)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)]"
      />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <div>
          <div
            className="animate-fade-in-up mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-1.5 font-mono text-xs uppercase tracking-wide text-primary"
            style={{ animationDelay: "0ms" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
            {data.hero_eyebrow}
          </div>

          <h1
            className="animate-fade-in-up font-display text-4xl font-bold leading-tight text-ink md:text-5xl lg:text-[3.4rem]"
            style={{ animationDelay: "90ms" }}
          >
            {data.hero_heading_pre}{" "}
            <span className="relative inline-block text-primary">
              {data.hero_heading_highlight}
              <span className="animate-underline-draw absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-primary-light" />
            </span>
            {data.hero_heading_post}
          </h1>

          <p
            className="animate-fade-in-up mt-6 max-w-xl text-lg text-ink-soft"
            style={{ animationDelay: "180ms" }}
          >
            {data.hero_subtitle}
          </p>

          <div
            className="animate-fade-in-up mt-9 flex flex-col gap-4 sm:flex-row"
            style={{ animationDelay: "270ms" }}
          >
            <Link
              href="/book-a-demo"
              className="rounded-lg bg-primary px-7 py-3 text-center font-mono text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-primary-dark"
            >
              {data.hero_cta_primary_label}
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-line bg-card px-7 py-3 text-center font-mono text-sm font-semibold text-ink transition-colors hover:bg-cream-dim"
            >
              {data.hero_cta_secondary_label}
            </Link>
          </div>

          <p
            className="animate-fade-in-up mt-5 font-mono text-xs text-ink-soft"
            style={{ animationDelay: "340ms" }}
          >
            {data.hero_note}
          </p>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <HeroDashboard
            totalPlacements={data.dashboard_total_placements}
            growthLabel={data.dashboard_growth_label}
            placements={sv(data.dashboard_placements)}
            notifications={sv(data.dashboard_notifications)}
            payrollLabel={data.dashboard_payroll_label}
            payrollAmount={data.dashboard_payroll_amount}
            payrollSubtext={data.dashboard_payroll_subtext}
            payrollStatus={data.dashboard_payroll_status}
            attendancePercent={data.dashboard_attendance_percent}
            attendanceSubtext={data.dashboard_attendance_subtext}
          />
        </div>
      </div>
    </section>
  );
}
