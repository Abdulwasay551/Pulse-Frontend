import { WidgetRenderer } from "./widgets";
import { sv, type Product } from "@/lib/cms";

export default function ProductCards({
  eyebrow,
  title,
  subtitle,
  products,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  products: Product[];
}) {
  return (
    <section id="solutions" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <div className="mb-3 font-mono text-xs uppercase tracking-wide text-primary">
            {eyebrow}
          </div>
          <h2 className="font-display text-3xl font-bold text-ink md:text-4xl">{title}</h2>
          <p className="mt-3 text-ink-soft">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col rounded-2xl border border-line bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-ink/5"
            >
              <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-wide text-primary">
                {product.tag}
              </span>
              <h3 className="font-display text-lg font-bold text-ink">{product.name}</h3>
              <p className="mt-2 mb-5 text-sm text-ink-soft">{product.short_description}</p>
              <div className="mt-auto rounded-xl bg-cream/60 p-3.5">
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
    </section>
  );
}
