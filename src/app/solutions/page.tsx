import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import CtaBanner from "@/components/site/CtaBanner";
import { WidgetRenderer } from "@/components/site/widgets";
import { getPage, getProducts, getSiteSettings, sv, type SolutionsPageData } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Solutions — EvoHR",
  description: "Every module in the EvoHR suite, from core CRM to global mobility.",
};

export default async function SolutionsPage() {
  const [data, products, settings] = await Promise.all([
    getPage<SolutionsPageData>("SolutionsPage"),
    getProducts(),
    getSiteSettings(),
  ]);

  return (
    <>
      <PageHeader eyebrow={data.eyebrow} title={data.heading} subtitle={data.subtitle} />

      <div className="px-6 pb-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-24">
          {products.map((product, i) => (
            <div
              key={product.id}
              className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-wide text-primary">
                  {product.tag}
                </span>
                <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
                  {product.name}
                </h2>
                <p className="mt-3 text-ink-soft">{product.long_description}</p>
                <ul className="mt-5 space-y-2.5">
                  {sv(product.bullets).map((b) => (
                    <li key={b} className="flex gap-2.5 text-sm text-ink">
                      <span className="text-primary">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-line bg-card p-6 shadow-lg shadow-ink/5">
                <WidgetRenderer
                  widgetType={product.widget_type}
                  rows={sv(product.widget_rows)}
                  stages={sv(product.widget_stages)}
                  skills={sv(product.widget_skills)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <CtaBanner title={settings.cta_default_title} subtitle={settings.cta_default_subtitle} />
    </>
  );
}
