import { Quote } from "lucide-react";
import RevealOnView from "./RevealOnView";
import { sv, type StreamItem, type Testimonial } from "@/lib/cms";

export default function Testimonials({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: StreamItem<Testimonial>[];
}) {
  const testimonials = sv(items);
  if (testimonials.length === 0) return null;

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <RevealOnView className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-3 font-mono text-xs uppercase tracking-wide text-primary">
            {eyebrow}
          </div>
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">{title}</h2>
        </RevealOnView>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <RevealOnView
              key={t.name}
              delayMs={i * 100}
              className="flex flex-col rounded-2xl border border-line bg-card p-7"
            >
              <Quote className="mb-4 h-6 w-6 text-primary-light" strokeWidth={2.5} />
              <p className="flex-1 text-[15px] leading-relaxed text-ink">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                  {t.initials}
                </span>
                <div>
                  <div className="text-sm font-semibold text-ink">{t.name}</div>
                  <div className="font-mono text-[11px] text-ink-soft">{t.title}</div>
                </div>
              </div>
            </RevealOnView>
          ))}
        </div>
      </div>
    </section>
  );
}
