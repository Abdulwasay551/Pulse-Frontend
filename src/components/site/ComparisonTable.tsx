import type { ComparisonRow, ComparisonValue } from "@/lib/cms";

function Cell({ value }: { value: ComparisonValue }) {
  if (value === "yes") return <span className="text-primary">✓</span>;
  if (value === "partial") return <span className="text-amber">±</span>;
  return <span className="text-ink-soft/40">—</span>;
}

export default function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="p-4 text-left font-mono text-xs uppercase tracking-wide text-ink-soft">
              Feature
            </th>
            <th className="p-4 text-center font-display font-semibold text-ink">Starter</th>
            <th className="p-4 text-center font-display font-semibold text-primary">Growth</th>
            <th className="p-4 text-center font-display font-semibold text-ink">Enterprise</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.feature} className="border-b border-line last:border-0">
              <td className="p-4 text-ink">{row.feature}</td>
              <td className="p-4 text-center">
                <Cell value={row.starter} />
              </td>
              <td className="p-4 text-center">
                <Cell value={row.growth} />
              </td>
              <td className="p-4 text-center">
                <Cell value={row.enterprise} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
