import BrandLoader from "@/components/site/BrandLoader";
import { Bar, CardGridSkeleton } from "@/components/site/Skeleton";

export default function Loading() {
  return (
    <>
      <BrandLoader />
      <section className="px-6 pt-16 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-10">
          <div>
            <Bar className="mb-6 h-7 w-64 rounded-full" />
            <Bar className="mb-3 h-11 w-full" />
            <Bar className="mb-3 h-11 w-5/6" />
            <Bar className="mb-6 h-11 w-2/3" />
            <Bar className="mb-2 h-4 w-full max-w-md" />
            <Bar className="mb-8 h-4 w-2/3 max-w-md" />
            <div className="flex gap-4">
              <Bar className="h-12 w-40 rounded-lg" />
              <Bar className="h-12 w-44 rounded-lg" />
            </div>
          </div>
          <Bar className="h-[360px] w-full rounded-3xl bg-cream-dim" />
        </div>
      </section>

      <section className="border-y border-line bg-card py-10">
        <div className="mx-auto flex max-w-6xl justify-center gap-16 px-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Bar key={i} className="h-5 w-28" />
          ))}
        </div>
      </section>

      <div className="pt-24">
        <div className="mx-auto mb-14 flex max-w-2xl flex-col items-center gap-3 px-6">
          <Bar className="h-4 w-32 rounded-full" />
          <Bar className="h-8 w-4/5" />
          <Bar className="h-4 w-2/3" />
        </div>
        <CardGridSkeleton />
      </div>

      <section className="bg-ink px-6 py-24">
        <Bar className="mx-auto h-8 w-3/5 max-w-xl bg-cream/10" />
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-y-10 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Bar className="h-10 w-20 bg-cream/10" />
              <Bar className="h-3 w-16 bg-cream/10" />
            </div>
          ))}
        </div>
        <Bar className="mx-auto mt-16 h-12 w-36 rounded-full bg-cream/10" />
      </section>
    </>
  );
}
