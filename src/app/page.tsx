import Hero from "@/components/site/Hero";
import LogoTicker from "@/components/site/LogoTicker";
import ProductCards from "@/components/site/ProductCards";
import { getPage, getProducts, sv, type HomePageData } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, products] = await Promise.all([
    getPage<HomePageData>("HomePage"),
    getProducts(),
  ]);

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
    </>
  );
}
