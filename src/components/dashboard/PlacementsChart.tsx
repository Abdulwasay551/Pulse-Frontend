"use client";

import { useInView } from "@/components/site/useInView";

export default function PlacementsChart({
  data,
}: {
  data: { month: string; value: number }[];
}) {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div ref={ref} className="flex h-40 items-stretch gap-3">
      {data.map((d, i) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className={`w-full rounded-t-md transition-[height] duration-700 ease-out ${
                i === data.length - 1 ? "bg-primary" : "bg-primary/20"
              }`}
              style={{ height: inView ? `${(d.value / max) * 100}%` : "0%", transitionDelay: `${i * 80}ms` }}
            />
          </div>
          <span className="text-[11px] text-ink-soft">{d.month}</span>
        </div>
      ))}
    </div>
  );
}
