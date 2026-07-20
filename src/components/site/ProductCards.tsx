import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductIcon from "./ProductIcon";
import RevealOnView from "./RevealOnView";
import { WidgetRenderer } from "./widgets";
import { sv, type Product } from "@/lib/cms";

// Every card is the same height; the bento stagger comes from shifting the
// card BODY down via translate-y — bookends stay put, the middle card's body
// sinks lowest, like a shallow smile. The badge is a sibling that does NOT
// get this transform, so every badge lands at the exact same line across
// the whole row regardless of how far its card sinks below it.
const LG_TRANSLATE_Y = ["lg:translate-y-0", "lg:translate-y-10", "lg:translate-y-20", "lg:translate-y-10", "lg:translate-y-0"];

// Alternating card treatments (dark / light / beige / light / accent) so the
// row reads with a color rhythm. Each card's corner badge uses a CONTRASTING
// color (not a tint of the card itself) so it reads as a distinct tag sitting
// in a cut corner, not a same-color ghost.
const CARD_VARIANTS = [
  {
    card: "bg-primary-dark",
    badge: "bg-cream",
    tag: "text-primary-light",
    title: "text-cream",
    desc: "text-cream/60",
    cta: "text-primary-light hover:text-cream",
    icon: "text-primary-dark",
  },
  {
    card: "bg-card border border-line",
    badge: "bg-primary",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    icon: "text-cream",
  },
  {
    card: "bg-cream-dim border border-line",
    badge: "bg-primary",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    icon: "text-cream",
  },
  {
    card: "bg-card border border-line",
    badge: "bg-primary",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    icon: "text-cream",
  },
  {
    card: "bg-primary-light",
    badge: "bg-cream",
    tag: "text-primary-dark",
    title: "text-cream",
    desc: "text-cream/80",
    cta: "text-cream hover:text-primary-dark",
    icon: "text-primary-dark",
  },
];

export default function ProductCards({
  eyebrow,
  title,
  subtitle,
  products,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: Product[];
}) {
  return (
    <section id="solutions" className="py-24">
      <RevealOnView className="mx-auto mb-14 max-w-2xl px-6 text-center">
        <div className="mb-3 font-mono text-xs uppercase tracking-wide text-primary">
          {eyebrow}
        </div>
        <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">{title}</h2>
        <p className="mt-3 text-ink-soft">{subtitle}</p>
      </RevealOnView>

      <div className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 lg:snap-none lg:items-start lg:gap-0 lg:overflow-visible lg:px-10 lg:pb-24 xl:px-16">
        {products.map((product, i) => {
          const variant = CARD_VARIANTS[i % CARD_VARIANTS.length];

          return (
            <RevealOnView
              key={product.id}
              delayMs={(i % 5) * 90}
              className="group relative w-[82%] shrink-0 snap-center sm:w-[45%] lg:h-[380px] lg:w-auto lg:flex-1 lg:shrink lg:snap-align-none"
            >
              {/* Hover tooltip: a floating "live preview" of the module's mini-dashboard widget */}
              <div className="pointer-events-none absolute inset-x-2 bottom-full z-20 mb-3 hidden -translate-y-1 opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 lg:block">
                <div className="rounded-xl border border-line bg-card p-4 shadow-xl shadow-ink/10">
                  <div className="mb-2.5 font-mono text-[10px] uppercase tracking-wide text-primary">
                    Live preview
                  </div>
                  <WidgetRenderer
                    widgetType={product.widget_type}
                    rows={sv(product.widget_rows)}
                    stages={sv(product.widget_stages)}
                    skills={sv(product.widget_skills)}
                  />
                </div>
                <div className="mx-4 h-3 w-3 -translate-y-1.5 rotate-45 border-r border-b border-line bg-card" />
              </div>

              <div
                className={`absolute -top-4 -left-4 z-10 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 ${variant.badge}`}
              >
                <ProductIcon
                  type={product.widget_type}
                  toneClassName={`bg-transparent ${variant.icon}`}
                  className="h-7 w-7"
                />
              </div>

              <div
                className={`flex h-full flex-col rounded-3xl p-7 transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-ink/10 ${variant.card} ${LG_TRANSLATE_Y[i % LG_TRANSLATE_Y.length]}`}
              >
                <span className={`mb-3 mt-6 inline-block w-fit font-mono text-xs font-semibold tracking-wide ${variant.tag}`}>
                  {product.tag}
                </span>
                <h3 className={`font-display text-lg font-bold ${variant.title}`}>{product.name}</h3>
                <p className={`mt-2 text-sm ${variant.desc}`}>{product.short_description}</p>

                <Link
                  href="/solutions"
                  className={`mt-auto flex w-fit items-center gap-1.5 pt-5 font-mono text-xs font-semibold transition-colors ${variant.cta}`}
                >
                  Explore {product.name}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </RevealOnView>
          );
        })}
      </div>
    </section>
  );
}
