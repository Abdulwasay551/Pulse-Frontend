import Hero from "@/components/site/Hero";
import LogoTicker from "@/components/site/LogoTicker";
import ProductCards from "@/components/site/ProductCards";
import Testimonials from "@/components/site/Testimonials";
import StatsBanner from "@/components/site/StatsBanner";
import VideoSection from "@/components/site/VideoSection";
import { CMS_ORIGIN, sv, type HomePageData, type Product } from "@/lib/cms";

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
      <VideoSection
        eyebrow={data.video_eyebrow}
        heading={data.video_heading}
        subtitle={data.video_subtitle}
        // Resolved to absolute URLs here (a server component, where
        // CMS_ORIGIN — built from the server-only CMS_API_URL env var —
        // is available) rather than inside the "use client" VideoSection,
        // whose browser bundle can't see non-NEXT_PUBLIC_ env vars.
        fileSrc={data.video_file_url ? `${CMS_ORIGIN}${data.video_file_url}` : ""}
        linkUrl={data.video_url}
        fallbackSrc={`${CMS_ORIGIN}/static/cms/videos/pulse-hrms-demo.mp4`}
      />
      <ProductCards
        eyebrow={data.suite_eyebrow}
        title={data.suite_title}
        subtitle={data.suite_subtitle}
        products={products}
      />
      <LogoTicker logos={sv(data.trust_logos)} />
      <Testimonials
        eyebrow={data.testimonials_eyebrow}
        title={data.testimonials_title}
        items={data.testimonials}
      />
      <StatsBanner
        heading={data.stats_heading}
        items={data.stats_items}
        ctaLabel={data.stats_cta_label}
      />
    </>
  );
}
