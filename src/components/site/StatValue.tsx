"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "./useInView";

function parseStat(raw: string) {
  const match = raw.match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return { prefix: "", number: null as number | null, suffix: raw };
  const [, prefix, numStr, suffix] = match;
  return { prefix, number: parseFloat(numStr.replace(/,/g, "")), suffix };
}

export default function StatValue({
  value,
  className = "",
  durationMs = 1400,
}: {
  value: string;
  className?: string;
  durationMs?: number;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.5);
  const { prefix, number, suffix } = parseStat(value);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current || number === null) return;
    started.current = true;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      requestAnimationFrame(() => setDisplay(number));
      return;
    }

    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      setDisplay(progress < 1 ? ease(progress) * number! : number!);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, number, durationMs]);

  if (number === null) {
    return (
      <span ref={ref} className={className}>
        {value}
      </span>
    );
  }

  const formatted = Number.isInteger(number)
    ? Math.round(display).toLocaleString()
    : display.toFixed(1);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
