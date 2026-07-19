import HomeView from "@/components/views/HomeView";
import { getPage, getProducts, type HomePageData } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [data, products] = await Promise.all([
    getPage<HomePageData>("HomePage"),
    getProducts(),
  ]);

  return <HomeView data={data} products={products} />;
}
