import PageHeader from "@/components/site/PageHeader";
import CtaBanner from "@/components/site/CtaBanner";
import StatValue from "@/components/site/StatValue";
import { sv, type SiteSettingsData, type UseCasesPageData } from "@/lib/cms";

export default function UseCasesView({
  data,
  settings,
}: {
  data: UseCasesPageData;
  settings: SiteSettingsData;
}) {
  const cases = sv(data.cases);
  const before = sv(data.before_items);
  const after = sv(data.after_items);

  return (
    <>
      <PageHeader eyebrow={data.eyebrow} title={data.heading} subtitle={data.subtitle} />

      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2">
          {cases.map((c) => (
            <div key={c.tag} className="flex flex-col rounded-2xl border border-line bg-card p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="font-mono text-xs font-semibold tracking-wide text-primary">
                  {c.tag}
                </span>
                <div className="text-right">
                  <StatValue
                    value={c.stat}
                    className="font-mono text-2xl font-bold tabular-nums text-ink"
                  />
                  <div className="text-[11px] text-ink-soft">{c.stat_label}</div>
                </div>
              </div>
              <h2 className="mt-3 font-display text-xl font-bold text-ink">{c.title}</h2>
              <p className="mt-2 text-sm text-ink-soft">{c.description}</p>
              <ul className="mt-5 space-y-2.5">
                {c.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5 text-sm text-ink">
                    <span className="text-primary">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <div className="mb-3 font-mono text-xs uppercase tracking-wide text-primary">
              {data.shift_eyebrow}
            </div>
            <h2 className="font-display text-3xl font-bold text-ink">{data.shift_title}</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-card p-7">
              <h3 className="mb-5 font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">
                The old way
              </h3>
              <ul className="space-y-3.5">
                {before.map((b) => (
                  <li key={b} className="flex gap-2.5 text-sm text-ink-soft">
                    <span className="text-maroon">✗</span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-primary bg-primary-dark p-7">
              <h3 className="mb-5 font-mono text-xs font-semibold uppercase tracking-wide text-primary-light/70">
                The EvoHR way
              </h3>
              <ul className="space-y-3.5">
                {after.map((a) => (
                  <li key={a} className="flex gap-2.5 text-sm text-cream/85">
                    <span className="text-primary-light">✓</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CtaBanner title={settings.cta_default_title} subtitle={settings.cta_default_subtitle} />
    </>
  );
}
