import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import ProductIcon from "./ProductIcon";
import RevealOnView from "./RevealOnView";
import { WidgetRenderer } from "./widgets";
import { sv, type Product } from "@/lib/cms";

// Symmetric arc on desktop — tallest at the bookends, shortest in the middle —
// bottom-aligned so it stair-steps like a bento layout instead of a flat grid.
const LG_HEIGHTS = ["lg:h-[440px]", "lg:h-[380px]", "lg:h-[300px]", "lg:h-[380px]", "lg:h-[440px]"];

// Alternating card treatments (dark / light / beige / light / accent) so the
// row reads with a color rhythm, instead of five identical white cards.
const CARD_VARIANTS = [
  {
    card: "bg-primary-dark",
    tag: "text-primary-light",
    title: "text-cream",
    desc: "text-cream/60",
    cta: "text-primary-light hover:text-cream",
    iconTone: "bg-cream/15 text-cream",
  },
  {
    card: "bg-card border border-line",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    iconTone: "bg-primary/10 text-primary",
  },
  {
    card: "bg-cream-dim border border-line",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    iconTone: "bg-card text-primary",
  },
  {
    card: "bg-card border border-line",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    iconTone: "bg-primary/10 text-primary",
  },
  {
    card: "bg-primary-light",
    tag: "text-primary-dark",
    title: "text-cream",
    desc: "text-cream/80",
    cta: "text-cream hover:text-primary-dark",
    iconTone: "bg-cream/25 text-cream",
  },
];

// The reference layout mirrors around the middle card: left-side cards carry
// their icon "tab" on their right shoulder, right-side cards on their left
// shoulder, and the middle card has no tab at all (plain, shorter, icon sits
// inline instead).
type TabSide = "left" | "right" | "none";
const TAB_SIDE: TabSide[] = ["right", "right", "none", "left", "left"];

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

      <div className="flex flex-col gap-6 px-6 lg:flex-row lg:items-end lg:gap-5 lg:px-10 xl:px-16">
        {products.map((product, i) => {
          const variant = CARD_VARIANTS[i % CARD_VARIANTS.length];
          const tabSide = TAB_SIDE[i % TAB_SIDE.length];

          return (
            <RevealOnView
              key={product.id}
              delayMs={(i % 5) * 90}
              className={`group relative flex-1 pt-5 lg:min-w-0 ${LG_HEIGHTS[i % LG_HEIGHTS.length]}`}
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

              {tabSide !== "none" && (
                <ProductIcon
                  type={product.widget_type}
                  toneClassName={variant.iconTone}
                  className={`absolute top-0 z-10 h-14 w-14 rounded-2xl shadow-md shadow-ink/10 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 ${
                    tabSide === "right" ? "right-5" : "left-5"
                  }`}
                />
              )}

              <div
                className={`flex h-full flex-col overflow-hidden rounded-3xl p-7 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-ink/10 ${variant.card} ${
                  tabSide !== "none" ? "pt-10" : ""
                }`}
              >
                {tabSide === "none" && (
                  <ProductIcon
                    type={product.widget_type}
                    toneClassName={variant.iconTone}
                    className="mb-4 h-11 w-11 transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110"
                  />
                )}
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
