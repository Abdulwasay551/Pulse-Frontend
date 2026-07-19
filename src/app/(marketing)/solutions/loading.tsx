import BrandLoader from "@/components/site/BrandLoader";
import { Bar, CtaBannerSkeleton, PageHeaderSkeleton } from "@/components/site/Skeleton";

export default function Loading() {
  return (
    <>
      <BrandLoader />
      <PageHeaderSkeleton />
      <div className="px-6 pb-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-24">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div>
                <Bar className="mb-3 h-4 w-28" />
                <Bar className="mb-3 h-8 w-2/3" />
                <Bar className="mb-2 h-4 w-full" />
                <Bar className="mb-6 h-4 w-1/2" />
                <div className="flex flex-col gap-2.5">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Bar key={j} className="h-3.5 w-full" />
                  ))}
                </div>
              </div>
              <Bar className="h-52 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
      <CtaBannerSkeleton />
    </>
  );
}
