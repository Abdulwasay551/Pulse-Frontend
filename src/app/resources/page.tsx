import type { Metadata } from "next";
import PageHeader from "@/components/site/PageHeader";
import CtaBanner from "@/components/site/CtaBanner";
import { getPage, getSiteSettings, sv, type ResourcesPageData } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Resources — EvoHR",
  description: "Guides, playbooks, and documentation for running your desk on EvoHR.",
};

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const [data, settings] = await Promise.all([
    getPage<ResourcesPageData>("ResourcesPage"),
    getSiteSettings(),
  ]);
  const posts = sv(data.blog_posts);
  const guides = sv(data.guides);
  const articles = sv(data.help_articles);

  return (
    <>
      <PageHeader eyebrow={data.eyebrow} title={data.heading} subtitle={data.subtitle} />

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-line bg-card p-7">
            <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-wide text-primary">
              BLOG
            </span>
            <h2 className="font-display text-xl font-bold text-ink">
              Notes from running a recruiting desk
            </h2>
            <div className="mt-5 flex flex-col">
              {posts.map((p) => (
                <a
                  key={p.title}
                  href="#"
                  className="border-b border-line py-3.5 last:border-0 hover:text-primary"
                >
                  <div className="text-sm font-semibold text-ink">{p.title}</div>
                  <div className="mt-1 font-mono text-[11px] text-ink-soft">{p.meta}</div>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-7">
            <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-wide text-primary">
              GUIDES
            </span>
            <h2 className="font-display text-xl font-bold text-ink">
              Playbooks for switching and scaling
            </h2>
            <div className="mt-5 flex flex-col">
              {guides.map((g) => (
                <a
                  key={g.title}
                  href="#"
                  className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-0 hover:text-primary"
                >
                  <div className="text-sm font-semibold text-ink">{g.title}</div>
                  <span className="shrink-0 rounded-full bg-cream-dim px-2.5 py-1 font-mono text-[10px] text-ink-soft">
                    {g.meta}
                  </span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-card p-7">
            <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-wide text-primary">
              HELP CENTER
            </span>
            <h2 className="font-display text-xl font-bold text-ink">Popular articles</h2>
            <div className="mt-5 flex flex-col">
              {articles.map((a) => (
                <a
                  key={a.title}
                  href="#"
                  className="flex items-center justify-between gap-4 border-b border-line py-3.5 last:border-0 hover:text-primary"
                >
                  <div className="text-sm font-semibold text-ink">{a.title}</div>
                  <span className="shrink-0 font-mono text-[11px] text-ink-soft">{a.meta}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-primary-dark p-7">
            <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-wide text-primary-light">
              API DOCS
            </span>
            <h2 className="font-display text-xl font-bold text-cream">{data.api_docs_title}</h2>
            <p className="mt-2 text-sm text-cream/50">{data.api_docs_description}</p>
            <pre className="mt-5 whitespace-pre-wrap rounded-xl bg-black/25 p-4 font-mono text-[12px] leading-relaxed text-primary-light">
              {data.api_docs_snippet}
            </pre>
          </div>
        </div>
      </section>

      <CtaBanner title={settings.cta_default_title} subtitle={settings.cta_default_subtitle} />
    </>
  );
}
