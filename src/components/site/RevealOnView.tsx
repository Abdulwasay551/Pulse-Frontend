"use client";

import { useInView } from "./useInView";

export default function RevealOnView({
  children,
  className = "",
  delayMs = 0,
  onMouseEnter,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  onMouseEnter?: () => void;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      onMouseEnter={onMouseEnter}
      className={`transition-all duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
