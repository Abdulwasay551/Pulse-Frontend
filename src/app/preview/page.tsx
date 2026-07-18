import HomeView from "@/components/views/HomeView";
import PricingView from "@/components/views/PricingView";
import SolutionsView from "@/components/views/SolutionsView";
import UseCasesView from "@/components/views/UseCasesView";
import WhoWeServeView from "@/components/views/WhoWeServeView";
import ResourcesView from "@/components/views/ResourcesView";
import {
  getPagePreview,
  getProducts,
  getSiteSettings,
  type HomePageData,
  type PricingPageData,
  type ResourcesPageData,
  type SolutionsPageData,
  type UseCasesPageData,
  type WhoWeServePageData,
} from "@/lib/cms";

export const dynamic = "force-dynamic";
export const metadata = { robots: "noindex, nofollow" };

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ content_type?: string; token?: string }>;
}) {
  const { content_type: contentType, token } = await searchParams;

  if (!contentType || !token) {
    return (
      <div className="px-6 py-24 text-center text-ink-soft">
        Missing preview parameters — open this page via the &quot;Preview&quot; button in Wagtail.
      </div>
    );
  }

  switch (contentType) {
    case "cms.homepage": {
      const [data, products] = await Promise.all([
        getPagePreview<HomePageData>(contentType, token),
        getProducts(),
      ]);
      return <HomeView data={data} products={products} />;
    }
    case "cms.pricingpage": {
      const [data, settings] = await Promise.all([
        getPagePreview<PricingPageData>(contentType, token),
        getSiteSettings(),
      ]);
      return <PricingView data={data} settings={settings} />;
    }
    case "cms.solutionspage": {
      const [data, products, settings] = await Promise.all([
        getPagePreview<SolutionsPageData>(contentType, token),
        getProducts(),
        getSiteSettings(),
      ]);
      return <SolutionsView data={data} products={products} settings={settings} />;
    }
    case "cms.usecasespage": {
      const [data, settings] = await Promise.all([
        getPagePreview<UseCasesPageData>(contentType, token),
        getSiteSettings(),
      ]);
      return <UseCasesView data={data} settings={settings} />;
    }
    case "cms.whoweservepage": {
      const [data, settings] = await Promise.all([
        getPagePreview<WhoWeServePageData>(contentType, token),
        getSiteSettings(),
      ]);
      return <WhoWeServeView data={data} settings={settings} />;
    }
    case "cms.resourcespage": {
      const [data, settings] = await Promise.all([
        getPagePreview<ResourcesPageData>(contentType, token),
        getSiteSettings(),
      ]);
      return <ResourcesView data={data} settings={settings} />;
    }
    default:
      return (
        <div className="px-6 py-24 text-center text-ink-soft">
          No preview available for content type &quot;{contentType}&quot;.
        </div>
      );
  }
}
