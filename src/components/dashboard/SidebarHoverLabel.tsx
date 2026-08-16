"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** A `truncate`d label that reveals its full text in a floating panel on
 * hover — either because the text is actually cut off (measured via
 * scrollWidth vs. clientWidth) or because `fullLabel` names a longer,
 * un-abbreviated version of a deliberately shortened `label` (the sidebar
 * displays a short name to stay readable; hovering still surfaces the
 * spec's real name) — and only for real mouse hover (touch "hover" is
 * harmless here since this is purely a `pointer-events-none` visual aid,
 * not something that can get stuck open like a click target). Rendered via
 * a portal to `document.body` so it can't be clipped by the sidebar nav's
 * `overflow-y-auto`. */
export default function SidebarHoverLabel({
  label,
  fullLabel,
  className,
}: {
  label: string;
  fullLabel?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number } | null>(null);
  const tooltipText = fullLabel && fullLabel !== label ? fullLabel : label;
  const shouldReveal = overflowing || (fullLabel != null && fullLabel !== label);

  useEffect(() => {
    function check() {
      const el = ref.current;
      if (el) setOverflowing(el.scrollWidth > el.clientWidth + 1);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [label]);

  function handleEnter() {
    if (!shouldReveal || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setRect({ top: r.top, left: r.left });
  }

  function handleLeave() {
    setRect(null);
  }

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className={`block truncate ${className ?? ""}`}
      >
        {label}
      </span>
      {rect &&
        typeof document !== "undefined" &&
        createPortal(
          <span
            style={{ top: rect.top - 9, left: rect.left - 10 }}
            className="pointer-events-none fixed z-[100] rounded-lg bg-primary-dark px-3 py-1.5 text-[12.5px] whitespace-nowrap text-cream shadow-xl ring-1 ring-cream/15"
          >
            {tooltipText}
          </span>,
          document.body
        )}
    </>
  );
}
