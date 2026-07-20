const COLORS = ["#4a2e82", "#4d6fe0", "#b9861f", "#6d6478"];

export default function DonutChart({
  data,
}: {
  data: { label: string; percent: number }[];
}) {
  const { stops } = data.reduce<{ cumulative: number; stops: string[] }>(
    (acc, d, i) => {
      const end = acc.cumulative + d.percent;
      return {
        cumulative: end,
        stops: [...acc.stops, `${COLORS[i % COLORS.length]} ${acc.cumulative}% ${end}%`],
      };
    },
    { cumulative: 0, stops: [] }
  );

  return (
    <div className="flex items-center gap-6">
      <div
        className="h-32 w-32 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${stops.join(", ")})`,
          mask: "radial-gradient(farthest-side, transparent calc(100% - 22px), black calc(100% - 22px))",
          WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 22px), black calc(100% - 22px))",
        }}
      />
      <div className="flex flex-col gap-2">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="text-ink">{d.label}</span>
            <span className="font-mono text-ink-soft">{d.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
