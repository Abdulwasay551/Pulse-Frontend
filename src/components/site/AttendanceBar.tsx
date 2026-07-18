"use client";

import { useInView } from "./useInView";

export default function AttendanceBar({ percent }: { percent: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.5);

  return (
    <div ref={ref} className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-cream/10">
      <div
        className="h-full rounded-full bg-primary-light transition-[width] duration-1000 ease-out"
        style={{ width: inView ? `${percent}%` : "0%" }}
      />
    </div>
  );
}
