import BrandLoader from "@/components/site/BrandLoader";
import { Bar, CtaBannerSkeleton, PageHeaderSkeleton } from "@/components/site/Skeleton";

export default function Loading() {
  return (
    <>
      <BrandLoader />
      <PageHeaderSkeleton />
      <section className="px-6 pb-24">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`grid grid-cols-1 items-center gap-8 rounded-2xl border border-line bg-card p-8 lg:grid-cols-2 lg:gap-12 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <Bar className="mb-3 h-4 w-32" />
                <Bar className="mb-2 h-6 w-2/3" />
                <Bar className="mb-6 h-3.5 w-full" />
                <div className="flex flex-col gap-2.5">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Bar key={j} className="h-3.5 w-full" />
                  ))}
                </div>
              </div>
              <Bar className="h-36 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </section>
      <CtaBannerSkeleton />
    </>
  );
}
