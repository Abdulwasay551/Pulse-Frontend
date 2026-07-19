import Hero from "@/components/site/Hero";
import LogoTicker from "@/components/site/LogoTicker";
import ProductCards from "@/components/site/ProductCards";
import StatsBanner from "@/components/site/StatsBanner";
import { sv, type HomePageData, type Product } from "@/lib/cms";

export default function HomeView({
  data,
  products,
}: {
  data: HomePageData;
  products: Product[];
}) {
  return (
    <>
      <Hero data={data} />
      <LogoTicker logos={sv(data.trust_logos)} />
      <ProductCards
        eyebrow={data.suite_eyebrow}
        title={data.suite_title}
        subtitle={data.suite_subtitle}
        products={products}
      />
      <StatsBanner
        heading={data.stats_heading}
        items={data.stats_items}
        ctaLabel={data.stats_cta_label}
      />
    </>
  );
}
