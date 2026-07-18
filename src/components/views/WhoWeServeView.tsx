import PageHeader from "@/components/site/PageHeader";
import CtaBanner from "@/components/site/CtaBanner";
import { WidgetRenderer } from "@/components/site/widgets";
import { sv, type SiteSettingsData, type WhoWeServePageData } from "@/lib/cms";

export default function WhoWeServeView({
  data,
  settings,
}: {
  data: WhoWeServePageData;
  settings: SiteSettingsData;
}) {
  const roles = sv(data.roles);

  return (
    <>
      <PageHeader eyebrow={data.eyebrow} title={data.heading} subtitle={data.subtitle} />

      <section className="px-6 pb-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          {roles.map((role, i) => (
            <div
              key={role.tag}
              className={`grid grid-cols-1 items-center gap-8 rounded-2xl border border-line bg-card p-8 lg:grid-cols-2 lg:gap-12 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-wide text-primary">
                  {role.tag}
                </span>
                <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
                  {role.title}
                </h2>
                <p className="mt-2 text-sm text-ink-soft">{role.description}</p>
                <ul className="mt-5 space-y-2.5">
                  {role.bullets.map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm text-ink">
                      <span className="text-primary">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-cream/60 p-5">
                <WidgetRenderer
                  widgetType={role.widget_type}
                  rows={role.widget_rows}
                  stages={role.widget_stages}
                  skills={role.widget_skills}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner title={settings.cta_default_title} subtitle={settings.cta_default_subtitle} />
    </>
  );
}
