import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductIcon from "./ProductIcon";
import RevealOnView from "./RevealOnView";
import { WidgetRenderer } from "./widgets";
import { sv, type Product } from "@/lib/cms";

// Staggered heights on desktop give the row its bento rhythm — bottom-aligned
// so the tops stair-step instead of everything sitting on one flat grid line.
const LG_HEIGHTS = ["lg:h-[440px]", "lg:h-[360px]", "lg:h-[410px]", "lg:h-[340px]", "lg:h-[470px]"];

// Alternating card treatments (dark / light / beige / light / accent) so the
// row reads with the same color rhythm as a bookended bento layout, instead
// of five identical white cards in a row.
const CARD_VARIANTS = [
  {
    card: "bg-primary-dark border-primary-dark",
    tag: "text-primary-light",
    title: "text-cream",
    desc: "text-cream/60",
    cta: "text-primary-light hover:text-cream",
    iconTone: "bg-cream/10 text-cream",
  },
  {
    card: "bg-card border-line",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    iconTone: "bg-primary/10 text-primary",
  },
  {
    card: "bg-cream-dim border-line",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    iconTone: "bg-card text-primary",
  },
  {
    card: "bg-card border-line",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    iconTone: "bg-primary/10 text-primary",
  },
  {
    card: "bg-primary-light border-primary-light",
    tag: "text-primary-dark",
    title: "text-cream",
    desc: "text-cream/80",
    cta: "text-cream hover:text-primary-dark",
    iconTone: "bg-cream/20 text-cream",
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

      <div className="flex flex-col gap-5 px-6 lg:flex-row lg:items-end lg:px-10 xl:px-16">
        {products.map((product, i) => {
          const variant = CARD_VARIANTS[i % CARD_VARIANTS.length];
          return (
            <RevealOnView
              key={product.id}
              delayMs={(i % 5) * 90}
              className={`group relative flex-1 lg:min-w-0 ${LG_HEIGHTS[i % LG_HEIGHTS.length]}`}
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
                className={`flex h-full flex-col overflow-hidden border p-7 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-ink/10 ${variant.card}`}
                style={{
                  clipPath: "polygon(28px 0, 100% 0, 100% 100%, 0 100%, 0 28px, 28px 28px)",
                }}
              >
                <ProductIcon
                  type={product.widget_type}
                  toneClassName={variant.iconTone}
                  className="mb-4 h-11 w-11 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110"
                />
                <span
                  className={`mb-3 inline-block w-fit font-mono text-xs font-semibold tracking-wide ${variant.tag}`}
                >
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
