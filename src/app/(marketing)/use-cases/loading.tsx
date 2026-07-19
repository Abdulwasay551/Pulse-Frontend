import BrandLoader from "@/components/site/BrandLoader";
import { Bar, CtaBannerSkeleton, PageHeaderSkeleton } from "@/components/site/Skeleton";

export default function Loading() {
  return (
    <>
      <BrandLoader />
      <PageHeaderSkeleton />
      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-card p-7">
              <div className="mb-3 flex justify-between">
                <Bar className="h-4 w-32" />
                <Bar className="h-7 w-14" />
              </div>
              <Bar className="mb-2 h-6 w-4/5" />
              <Bar className="mb-6 h-3.5 w-full" />
              <div className="flex flex-col gap-2.5">
                {Array.from({ length: 3 }).map((_, j) => (
                  <Bar key={j} className="h-3.5 w-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-5 md:grid-cols-2">
          <Bar className="h-56 w-full rounded-2xl" />
          <Bar className="h-56 w-full rounded-2xl bg-line" />
        </div>
      </section>
      <CtaBannerSkeleton />
    </>
  );
}
