import BrandLoader from "@/components/site/BrandLoader";
import { Bar, CtaBannerSkeleton, PageHeaderSkeleton } from "@/components/site/Skeleton";

export default function Loading() {
  return (
    <>
      <BrandLoader />
      <PageHeaderSkeleton />
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-card p-7">
              <Bar className="mb-3 h-4 w-20" />
              <Bar className="mb-5 h-5 w-2/3" />
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j}>
                    <Bar className="mb-1.5 h-3.5 w-full" />
                    <Bar className="h-3 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <CtaBannerSkeleton />
    </>
  );
}
