"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import ProductIcon from "./ProductIcon";
import RevealOnView from "./RevealOnView";
import { TrendGraph, WidgetRenderer, type TrendGraphData } from "./widgets";
import { sv, type Product } from "@/lib/cms";

// Every card is the same height; the bento stagger comes from shifting the
// card body down via translate-y — bookends stay put, the middle card sinks
// lowest, like a shallow smile.
const LG_TRANSLATE_Y = ["lg:translate-y-0", "lg:translate-y-10", "lg:translate-y-20", "lg:translate-y-10", "lg:translate-y-0"];

// Two radial color blobs (one per corner) plus a dotted-grid texture — the
// panel background this generates should read as a deliberate pattern, not
// a tinted sheet. The dot grain is light on dark bases (so it shows up
// against a dark fill) and dark on light bases, matching whichever base
// color that panel inherits from its own card.
function panelPattern(cornerA: string, cornerB: string, dot: string) {
  return {
    backgroundImage: [
      `radial-gradient(circle at 6% 4%, ${cornerA}, transparent 48%)`,
      `radial-gradient(circle at 100% 100%, ${cornerB}, transparent 46%)`,
      `radial-gradient(${dot} 1.5px, transparent 1.5px)`,
    ].join(", "),
    backgroundSize: "auto, auto, 18px 18px",
  } as const;
}

const DARK_DOT = "rgba(255,255,255,0.09)";
const LIGHT_DOT = "rgba(33,26,46,0.09)";

// Five distinct backgrounds so no two cards (especially the pair flanking
// the middle one) share the same color, plus a contrasting badge chip for
// each — never a tint of the card's own color, always a clear pop.
// The opened detail menu now inherits `panelBase` (the same base color as
// the card itself, minus the grid card's border) with `panelPattern`
// layered on top, and reuses `tag`/`title`/`desc` for its own text so it's
// automatically light-on-dark or dark-on-light exactly like the card is.
const CARD_VARIANTS = [
  {
    card: "bg-primary-dark",
    panelBase: "bg-primary-dark",
    isDarkPanel: true,
    badge: "bg-primary-light",
    tag: "text-primary-light",
    title: "text-cream",
    desc: "text-cream/60",
    cta: "text-primary-light hover:text-cream",
    icon: "text-cream",
    widgetBg: "bg-cream",
    panelPattern: panelPattern("rgba(77,111,224,0.38)", "rgba(246,236,217,0.14)", DARK_DOT),
  },
  {
    card: "bg-card border border-line",
    panelBase: "bg-card",
    isDarkPanel: false,
    badge: "bg-primary",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    icon: "text-cream",
    widgetBg: "bg-cream-dim",
    panelPattern: panelPattern("rgba(74,46,130,0.24)", "rgba(185,134,31,0.24)", LIGHT_DOT),
  },
  {
    card: "bg-cream-dim border border-line",
    panelBase: "bg-cream-dim",
    isDarkPanel: false,
    badge: "bg-primary-light",
    tag: "text-primary",
    title: "text-ink",
    desc: "text-ink-soft",
    cta: "text-primary hover:text-primary-dark",
    icon: "text-cream",
    widgetBg: "bg-card",
    panelPattern: panelPattern("rgba(77,111,224,0.28)", "rgba(74,46,130,0.22)", LIGHT_DOT),
  },
  {
    card: "bg-primary-light",
    panelBase: "bg-primary-light",
    isDarkPanel: true,
    badge: "bg-cream",
    tag: "text-primary-dark",
    title: "text-cream",
    desc: "text-cream/80",
    cta: "text-cream hover:text-primary-dark",
    icon: "text-primary-dark",
    widgetBg: "bg-cream",
    panelPattern: panelPattern("rgba(246,236,217,0.22)", "rgba(185,134,31,0.26)", DARK_DOT),
  },
  {
    card: "bg-primary-dark",
    panelBase: "bg-primary-dark",
    isDarkPanel: true,
    badge: "bg-cream",
    tag: "text-primary-light",
    title: "text-cream",
    desc: "text-cream/60",
    cta: "text-primary-light hover:text-cream",
    icon: "text-primary-dark",
    widgetBg: "bg-cream",
    panelPattern: panelPattern("rgba(185,134,31,0.30)", "rgba(77,111,224,0.32)", DARK_DOT),
  },
];

// Sample trend data for the small animated graph in the opened detail menu —
// illustrative, not wired to real numbers, one flavor per product so it feels
// specific to that solution rather than a generic chart.
const GRAPH_SAMPLES: TrendGraphData[] = [
  {
    statLabel: "Payroll processed",
    statValue: 186,
    statPrefix: "$",
    statSuffix: "K",
    deltaValue: 12,
    bars: [40, 52, 48, 61, 70, 82, 100],
  },
  {
    statLabel: "Placements this quarter",
    statValue: 24,
    deltaValue: 18,
    bars: [30, 45, 40, 58, 66, 78, 100],
  },
  {
    statLabel: "Benefits enrollment",
    statValue: 93,
    statSuffix: "%",
    deltaValue: 6,
    bars: [55, 60, 64, 70, 76, 85, 100],
  },
  {
    statLabel: "Requisitions filled",
    statValue: 41,
    deltaValue: 9,
    bars: [35, 42, 38, 50, 62, 74, 100],
  },
  {
    statLabel: "Active relocations",
    statValue: 12,
    deltaValue: 3,
    bars: [45, 50, 47, 55, 60, 68, 100],
  },
];

// The two bookend cards get a bigger, more dramatic rounded corner on their
// outer edge (like a pronounced cut), while the corner facing a neighbor
// stays at the normal radius since the cards sit flush against each other.
const CORNER_OVERRIDE = ["lg:rounded-l-[40px]", "", "", "", "lg:rounded-r-[40px]"];

// How long a card has to stay hovered before it triggers the expanded
// business-card-toss view, and how long the 3D flip-and-travel itself takes.
const HOVER_DELAY_MS = 250;
const FLIP_DURATION_S = 1.4;

// Shared with the rotateY keyframes in globals.css so the card visibly
// turns *while* it travels instead of arriving first and rotating after —
// both start slow and accelerate together, like one continuous toss.
const TRAVEL_EASE = [0.55, 0, 0.85, 0.36] as const;

// The hover-and-toss interaction only makes sense once there's room for the
// two-pane overlay (matches the "lg" breakpoint the overlay itself uses).
// Below that, cards stay put and tap-flip in place instead — otherwise a
// touch tap fires the same hover state and the card vanishes into an
// overlay that's `hidden` at that width, with nothing left in its place.
const DESKTOP_QUERY = "(min-width: 1024px)";
const MOBILE_FLIP_DURATION_MS = 700;

function subscribeToDesktopQuery(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getIsDesktopSnapshot() {
  return window.matchMedia(DESKTOP_QUERY).matches;
}

function getIsDesktopServerSnapshot() {
  return false;
}

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
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const isDesktop = useSyncExternalStore(subscribeToDesktopQuery, getIsDesktopSnapshot, getIsDesktopServerSnapshot);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleCardEnter(i: number) {
    if (!isDesktop) return;
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

  function handleCardTap(i: number) {
    if (isDesktop) return;
    setFlippedIndex((current) => (current === i ? null : i));
  }

  const activeProduct = isDesktop && activeIndex !== null ? products[activeIndex] : null;
  const activeVariant = isDesktop && activeIndex !== null ? CARD_VARIANTS[activeIndex % CARD_VARIANTS.length] : null;
  const activeGraph = isDesktop && activeIndex !== null ? GRAPH_SAMPLES[activeIndex % GRAPH_SAMPLES.length] : null;
  // Cards toward the right of the row (and the middle card) toss themselves
  // the opposite way: the flipping card travels toward the left side of the
  // screen instead of the right, and the detail panel swaps to the right so
  // it always opens on the side the card vacated.
  const isRightOrigin = activeIndex !== null && activeIndex >= 3;

  return (
    <section id="solutions" className="py-24">
      <RevealOnView className="mx-auto mb-14 max-w-2xl px-6 text-center">
        <div className="mb-3 text-xs uppercase tracking-wide text-primary">
          {eyebrow}
        </div>
        <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">{title}</h2>
        <p className="mt-3 text-ink-soft">{subtitle}</p>
      </RevealOnView>

      <div className="relative lg:min-h-[500px]" onMouseLeave={handleAreaLeave}>
        <div className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 lg:snap-none lg:items-start lg:gap-2 lg:overflow-visible lg:px-10 lg:pb-24 xl:px-16">
          {products.map((product, i) => {
            const variant = CARD_VARIANTS[i % CARD_VARIANTS.length];
            // Only the desktop hover-toss removes the card from the grid (it
            // reappears in the overlay via the shared layoutId). Below the
            // "lg" breakpoint the overlay is hidden, so the card always stays
            // put here — tapping it flips it in place instead.
            const isTossing = isDesktop && activeIndex === i;
            const someOtherActive = isDesktop && activeIndex !== null && !isTossing;
            const isFlipped = !isDesktop && flippedIndex === i;

            return (
              <RevealOnView
                key={product.id}
                delayMs={(i % 5) * 90}
                onMouseEnter={() => handleCardEnter(i)}
                className="group relative h-[460px] w-[82%] shrink-0 snap-center sm:w-[45%] lg:h-[380px] lg:w-auto lg:flex-1 lg:shrink lg:snap-align-none"
              >
                {/* Rendered here whenever this card isn't mid-toss. On desktop, when
                    it IS tossing, this slot renders nothing — the very same layoutId
                    is picked up by the overlay below, so Motion glides this exact
                    card (not a copy) from its grid position out to the target spot
                    instead of faking it with a fade-out + separately faded-in
                    lookalike. On mobile/tablet the card never leaves this slot; a
                    tap flips it in place to reveal the same detail on its back. */}
                {!isTossing && (
                  <motion.div
                    layout
                    layoutId={`solution-card-${product.id}`}
                    initial={false}
                    animate={{ opacity: someOtherActive ? 0 : 1 }}
                    whileHover={isDesktop ? { y: -10 } : undefined}
                    onClick={() => handleCardTap(i)}
                    transition={{
                      layout: { duration: FLIP_DURATION_S, ease: TRAVEL_EASE },
                      opacity: { duration: 0.3 },
                      y: { duration: 0.3, ease: "easeOut" },
                    }}
                    className={`h-full ${someOtherActive ? "pointer-events-none" : "pointer-events-auto"} ${LG_TRANSLATE_Y[i % LG_TRANSLATE_Y.length]}`}
                    style={{ perspective: 1200 }}
                  >
                    <div
                      className="relative h-full w-full transition-transform ease-[cubic-bezier(0.65,0,0.35,1)] [transform-style:preserve-3d]"
                      style={{
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                        transitionDuration: `${MOBILE_FLIP_DURATION_MS}ms`,
                      }}
                    >
                      {/* Front face — same content/shape as always. */}
                      <div
                        className={`absolute inset-0 flex h-full flex-col rounded-3xl p-7 shadow-md shadow-ink/5 transition-shadow duration-300 ease-out [backface-visibility:hidden] group-hover:shadow-xl group-hover:shadow-ink/15 ${variant.card} ${CORNER_OVERRIDE[i % CORNER_OVERRIDE.length]}`}
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
                        <span className={`mb-3 inline-block w-fit text-xs font-semibold tracking-wide ${variant.tag}`}>
                          {product.tag}
                        </span>
                        <h3 className={`font-display text-lg font-bold ${variant.title}`}>{product.name}</h3>
                        <p className={`mt-2 text-sm ${variant.desc}`}>{product.short_description}</p>

                        <Link
                          href="/solutions"
                          onClick={(e) => e.stopPropagation()}
                          className={`mt-auto flex w-fit items-center gap-1.5 pt-5 text-xs font-semibold transition-colors ${variant.cta}`}
                        >
                          Explore {product.name}
                          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                        <span className="pt-3 text-[11px] text-ink-soft/70 lg:hidden">
                          Tap for details
                        </span>
                      </div>

                      {/* Back face — mobile/tablet only content: the same detail a
                          desktop hover would toss into an overlay, shown in place
                          since there's no room to fly a card across a phone screen. */}
                      <div
                        className={`absolute inset-0 flex h-full flex-col overflow-y-auto rounded-3xl p-7 shadow-md shadow-ink/5 [backface-visibility:hidden] [transform:rotateY(180deg)] ${variant.card} ${CORNER_OVERRIDE[i % CORNER_OVERRIDE.length]}`}
                      >
                        <span className={`mb-3 inline-block w-fit text-xs font-semibold tracking-wide ${variant.tag}`}>
                          {product.tag}
                        </span>
                        <h3 className={`font-display text-lg font-bold ${variant.title}`}>{product.name}</h3>
                        <p className={`mt-2 text-sm ${variant.desc}`}>
                          {product.long_description || product.short_description}
                        </p>
                        {sv(product.bullets).length > 0 && (
                          <ul className="mt-4 flex flex-col gap-2">
                            {sv(product.bullets).map((bullet) => (
                              <li key={bullet} className={`flex items-start gap-2 text-xs ${variant.desc}`}>
                                <span className={`mt-0.5 ${variant.tag}`}>✓</span>
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}
                        <Link
                          href="/solutions"
                          onClick={(e) => e.stopPropagation()}
                          className={`mt-auto flex w-fit items-center gap-1.5 pt-5 text-xs font-semibold transition-colors ${variant.cta}`}
                        >
                          Explore {product.name}
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </RevealOnView>
            );
          })}
        </div>

        <AnimatePresence>
          {activeProduct && activeVariant && activeGraph && (
            <div
              className="absolute inset-0 hidden items-center gap-8 px-10 lg:flex xl:px-16"
              style={{ perspective: 1600 }}
            >
              {/* Big detail panel — full breakdown of the hovered module, fades in only
                  once the card has finished flipping into place. Borderless, with a
                  soft per-product radial wash (see CARD_VARIANTS.panelGradient) instead
                  of one flat neutral sheet for every product. */}
              <motion.div
                key="detail-panel"
                initial={{ opacity: 0, x: isRightOrigin ? 48 : -48, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: isRightOrigin ? 48 : -48, scale: 0.97, transition: { duration: 0.25 } }}
                transition={{ duration: 0.5, delay: FLIP_DURATION_S - 0.15, ease: [0.22, 1, 0.36, 1] }}
                className={`min-w-0 flex-1 rounded-3xl p-10 ${activeVariant.panelBase} ${isRightOrigin ? "order-2" : "order-1"}`}
                style={activeVariant.panelPattern}
              >
                <span className={`mb-4 inline-block w-fit text-xs font-semibold tracking-wide ${activeVariant.tag}`}>
                  {activeProduct.tag}
                </span>
                <h3 className={`font-display text-3xl font-bold ${activeVariant.title}`}>{activeProduct.name}</h3>
                <div className="mt-4 grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
                  <div className="min-w-0">
                    <p className={`text-[15px] leading-relaxed ${activeVariant.desc}`}>
                      {activeProduct.long_description || activeProduct.short_description}
                    </p>
                    {sv(activeProduct.bullets).length > 0 && (
                      <ul className="mt-6 flex flex-col gap-2.5">
                        {sv(activeProduct.bullets).map((bullet) => (
                          <li key={bullet} className={`flex items-start gap-2.5 text-sm ${activeVariant.title}`}>
                            <span className={`mt-0.5 ${activeVariant.tag}`}>✓</span>
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      href="/solutions"
                      className="mt-8 flex w-fit items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-xs font-semibold text-cream transition-colors hover:bg-primary-dark"
                    >
                      Explore {activeProduct.name}
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <TrendGraph data={activeGraph} dark={activeVariant.isDarkPanel} />
                </div>
              </motion.div>

              {/* The hovered card itself — same layoutId as its grid counterpart above,
                  so Motion continuously glides this exact card from its original grid
                  slot into place here rather than cutting to a stand-in. Position/size
                  travel lives on this outer element; the 3D turn lives on its own inner
                  "flipper" so the two transforms don't fight each other. The flipper
                  starts edge-on showing a blank back (no data), spinning slowly at
                  first and accelerating into the turn, and only reveals the real
                  content once it finishes rotating to face forward at rest. */}
              <motion.div
                key={activeProduct.id}
                layout
                layoutId={`solution-card-${activeProduct.id}`}
                transition={{ layout: { duration: FLIP_DURATION_S, ease: TRAVEL_EASE } }}
                className={`h-[420px] w-72 shrink-0 ${isRightOrigin ? "order-1" : "order-2"}`}
                style={{ perspective: 1600 }}
              >
                {/* Plain CSS (not Framer Motion) for the 3D flip rotation specifically —
                    Framer's computed matrix3d for rotateY produces an incorrect
                    backface-visibility result (front face bleeding through mirrored);
                    a bare CSS transform doesn't have that problem. */}
                <div
                  className={`relative h-full w-full ${isRightOrigin ? "animate-card-flip-reveal-reverse" : "animate-card-flip-reveal"}`}
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
                    <span className={`mb-3 inline-block w-fit text-xs font-semibold tracking-wide ${activeVariant.tag}`}>
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
