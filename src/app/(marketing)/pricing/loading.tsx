import BrandLoader from "@/components/site/BrandLoader";
import { Bar, CardGridSkeleton, CtaBannerSkeleton, PageHeaderSkeleton } from "@/components/site/Skeleton";

export default function Loading() {
  return (
    <>
      <BrandLoader />
      <PageHeaderSkeleton />
      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-line bg-card p-8">
              <Bar className="mb-2 h-5 w-24" />
              <Bar className="mb-6 h-4 w-full" />
              <Bar className="mb-8 h-9 w-28" />
              <div className="mb-8 flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Bar key={j} className="h-3.5 w-full" />
                ))}
              </div>
              <Bar className="h-11 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </section>
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-4xl rounded-2xl border border-line bg-card p-9">
          <div className="mx-auto mb-8 flex max-w-xl flex-col items-center gap-3">
            <Bar className="h-4 w-32 rounded-full" />
            <Bar className="h-7 w-4/5" />
          </div>
          <Bar className="mx-auto h-2 w-full max-w-xl" />
          <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Bar key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
      <CardGridSkeleton count={3} />
      <CtaBannerSkeleton />
    </>
  );
}
