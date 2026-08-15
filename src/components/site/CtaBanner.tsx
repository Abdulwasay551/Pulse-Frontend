import Link from "next/link";

export default function CtaBanner({
  title = "Put your desk on the record.",
  subtitle = "Start a free 30-day trial. No credit card, no setup calls required.",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <section className="px-6 py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-primary-dark px-8 py-16 text-center">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,107,53,0.18), transparent 45%)",
          }}
        />
        <h2 className="relative font-display text-3xl font-bold text-cream md:text-4xl">
          {title}
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-cream/60">{subtitle}</p>
        <div className="relative mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/book-a-demo"
            className="rounded-lg bg-primary-light px-7 py-3 text-sm font-semibold text-primary-dark transition-colors hover:bg-cream"
          >
            Book a Demo
          </Link>
          <Link
            href="/pricing"
            className="rounded-lg border border-cream/25 px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
          >
            See pricing
          </Link>
        </div>
      </div>
    </section>
  );
}
