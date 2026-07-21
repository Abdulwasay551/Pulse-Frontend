"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import ProductIcon from "./ProductIcon";
import RevealOnView from "./RevealOnView";
import { WidgetRenderer } from "./widgets";
import { sv, type Product } from "@/lib/cms";

// Every card is the same height; the bento stagger comes from shifting the
// card body down via translate-y — bookends stay put, the middle card sinks
// lowest, like a shallow smile.
const LG_TRANSLATE_Y = ["lg:translate-y-0", "lg:translate-y-10", "lg:translate-y-20", "lg:translate-y-10", "lg:translate-y-0"];

// Five distinct backgrounds so no two cards (especially the pair flanking
// the middle one) share the same color, plus a contrasting badge chip for
// each — never a tint of the card's own color, always a clear pop.
const CARD_VARIANTS = [
  {
    card: "bg-primary-dark",
    badge: "bg-primary-light",
    tag: "text-primary-light",
    title: "text-cream",
    desc: "text-cream/60",
    cta: "text-primary-light hover:text-cream",
    icon: "text-cream",
    widgetBg: "bg-cream",
  },
  {
    card: "bg-card border border-line",
    badge: "bg-primary",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    icon: "text-cream",
    widgetBg: "bg-cream-dim",
  },
  {
    card: "bg-cream-dim border border-line",
    badge: "bg-primary-light",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    icon: "text-cream",
    widgetBg: "bg-card",
  },
  {
    card: "bg-primary-light",
    badge: "bg-cream",
    tag: "text-primary-dark",
    title: "text-cream",
    desc: "text-cream/80",
    cta: "text-cream hover:text-primary-dark",
    icon: "text-primary-dark",
    widgetBg: "bg-cream",
  },
  {
    card: "bg-primary-dark",
    badge: "bg-cream",
    tag: "text-primary-light",
    title: "text-cream",
    desc: "text-cream/60",
    cta: "text-primary-light hover:text-cream",
    icon: "text-primary-dark",
    widgetBg: "bg-cream",
  },
];

// The two bookend cards get a bigger, more dramatic rounded corner on their
// outer edge (like a pronounced cut), while the corner facing a neighbor
// stays at the normal radius since the cards sit flush against each other.
const CORNER_OVERRIDE = ["lg:rounded-l-[40px]", "", "", "", "lg:rounded-r-[40px]"];

// How long a card has to stay hovered before it triggers the expanded
// business-card-toss view, and how long the 3D flip-and-travel itself takes.
const HOVER_DELAY_MS = 1000;
const FLIP_DURATION_S = 1.8;

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleCardEnter(i: number) {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setActiveIndex(i), HOVER_DELAY_MS);
  }

  function handleAreaLeave() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setActiveIndex(null);
  }

  const activeProduct = activeIndex !== null ? products[activeIndex] : null;
  const activeVariant = activeIndex !== null ? CARD_VARIANTS[activeIndex % CARD_VARIANTS.length] : null;

  return (
    <section id="solutions" className="py-24">
      <RevealOnView className="mx-auto mb-14 max-w-2xl px-6 text-center">
        <div className="mb-3 font-mono text-xs uppercase tracking-wide text-primary">
          {eyebrow}
        </div>
        <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">{title}</h2>
        <p className="mt-3 text-ink-soft">{subtitle}</p>
      </RevealOnView>

      <div className="relative lg:min-h-[500px]" onMouseLeave={handleAreaLeave}>
        <div className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 lg:snap-none lg:items-start lg:gap-0 lg:overflow-visible lg:px-10 lg:pb-24 xl:px-16">
          {products.map((product, i) => {
            const variant = CARD_VARIANTS[i % CARD_VARIANTS.length];

            return (
              <RevealOnView
                key={product.id}
                delayMs={(i % 5) * 90}
                onMouseEnter={() => handleCardEnter(i)}
                className="group relative w-[82%] shrink-0 snap-center sm:w-[45%] lg:h-[380px] lg:w-auto lg:flex-1 lg:shrink lg:snap-align-none"
              >
                <AnimatePresence>
                  {activeIndex === null && (
                    <motion.div
                      initial={false}
                      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.25 } }}
                      className={`flex h-full flex-col rounded-3xl p-7 transition-shadow duration-300 ease-out group-hover:shadow-lg group-hover:shadow-ink/10 ${variant.card} ${LG_TRANSLATE_Y[i % LG_TRANSLATE_Y.length]} ${CORNER_OVERRIDE[i % CORNER_OVERRIDE.length]}`}
                    >
                      <div
                        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:-rotate-6 group-hover:scale-110 ${variant.badge}`}
                      >
                        <ProductIcon
                          type={product.widget_type}
                          toneClassName={`bg-transparent ${variant.icon}`}
                          className="h-6 w-6"
                        />
                      </div>
                      <span className={`mb-3 inline-block w-fit font-mono text-xs font-semibold tracking-wide ${variant.tag}`}>
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </RevealOnView>
            );
          })}
        </div>

        <AnimatePresence>
          {activeProduct && activeVariant && (
            <div
              className="absolute inset-0 hidden items-center gap-8 px-10 lg:flex xl:px-16"
              style={{ perspective: 1600 }}
            >
              {/* Big detail panel — full breakdown of the hovered module, fades in only once the card has finished flipping into place */}
              <motion.div
                key="detail-panel"
                initial={{ opacity: 0, x: -48, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -48, scale: 0.97, transition: { duration: 0.25 } }}
                transition={{ duration: 0.5, delay: FLIP_DURATION_S - 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="min-w-0 flex-1 rounded-3xl border border-line bg-card p-10"
              >
                <span className="mb-4 inline-block w-fit font-mono text-xs font-semibold tracking-wide text-primary">
                  {activeProduct.tag}
                </span>
                <h3 className="font-display text-3xl font-bold text-ink">{activeProduct.name}</h3>
                <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-soft">
                  {activeProduct.long_description || activeProduct.short_description}
                </p>
                {sv(activeProduct.bullets).length > 0 && (
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {sv(activeProduct.bullets).map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm text-ink">
                        <span className="mt-0.5 text-primary">✓</span>
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  href="/solutions"
                  className="mt-8 flex w-fit items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 font-mono text-xs font-semibold text-cream transition-colors hover:bg-primary-dark"
                >
                  Explore {activeProduct.name}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>

              {/* The hovered card, flipping through 3D space to the right like a tossed business
                  card. Translation lives on the outer element; rotation lives on its own inner
                  "flipper" so the 3D compositing isn't fighting a combined transform. It starts
                  edge-on showing a blank back (no data), and only reveals the real content once
                  it finishes rotating to face forward at rest. */}
              <motion.div
                key="tossed-card"
                initial={{ opacity: 0, x: -160 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.35 } }}
                transition={{ duration: FLIP_DURATION_S, ease: [0.45, 0, 0.2, 1] }}
                className="h-[420px] w-72 shrink-0"
                style={{ perspective: 1600 }}
              >
                <div
                  className="animate-card-flip-reveal relative h-full w-full"
                  style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" }}
                >
                  {/* Back face — solid color, no content, only visible mid-flip */}
                  <div
                    className={`absolute inset-0 rounded-3xl shadow-2xl shadow-ink/20 ${activeVariant.card}`}
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  />

                  {/* Front face — the real content, hidden until the flip brings it forward */}
                  <div
                    className={`absolute inset-0 flex flex-col rounded-3xl p-7 shadow-2xl shadow-ink/20 ${activeVariant.card}`}
                    style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                  >
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${activeVariant.badge}`}>
                      <ProductIcon
                        type={activeProduct.widget_type}
                        toneClassName={`bg-transparent ${activeVariant.icon}`}
                        className="h-6 w-6"
                      />
                    </div>
                    <span className={`mb-3 inline-block w-fit font-mono text-xs font-semibold tracking-wide ${activeVariant.tag}`}>
                      {activeProduct.tag}
                    </span>
                    <h3 className={`font-display text-lg font-bold ${activeVariant.title}`}>{activeProduct.name}</h3>
                    <p className={`mt-2 text-sm ${activeVariant.desc}`}>{activeProduct.short_description}</p>
                    <div className={`mt-6 rounded-xl p-3.5 ${activeVariant.widgetBg}`}>
                      <WidgetRenderer
                        widgetType={activeProduct.widget_type}
                        rows={sv(activeProduct.widget_rows)}
                        stages={sv(activeProduct.widget_stages)}
                        skills={sv(activeProduct.widget_skills)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
