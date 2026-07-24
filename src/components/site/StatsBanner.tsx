import Link from "next/link";
import RevealOnView from "./RevealOnView";
import StatValue from "./StatValue";
import { sv, type StatItem, type StreamItem } from "@/lib/cms";

export default function StatsBanner({
  heading,
  items,
  ctaLabel,
}: {
  heading: string;
  items: StreamItem<StatItem>[];
  ctaLabel: string;
}) {
  const stats = sv(items);

  return (
    <section className="bg-ink px-6 py-24 text-center">
      <RevealOnView className="mx-auto max-w-3xl">
        <h2 className="font-display text-3xl font-bold text-cream md:text-4xl">{heading}</h2>
      </RevealOnView>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-y-10 sm:grid-cols-4">
        {stats.map((s, i) => (
          <RevealOnView key={s.label} delayMs={i * 100}>
            <StatValue
              value={s.value}
              className="font-mono text-4xl font-bold tabular-nums text-cream md:text-5xl"
            />
            <div className="mt-2 text-sm text-cream/50">{s.label}</div>
          </RevealOnView>
        ))}
      </div>

      <RevealOnView delayMs={300} className="mt-16">
        <Link
          href="/book-a-demo"
          className="inline-block rounded-full bg-cream px-8 py-3.5 font-mono text-sm font-semibold text-ink transition-colors hover:bg-cream-dim"
        >
          {ctaLabel}
        </Link>
      </RevealOnView>
    </section>
  );
}
