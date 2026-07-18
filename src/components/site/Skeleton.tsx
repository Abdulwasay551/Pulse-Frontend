export function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-cream-dim ${className}`} />;
}

export function PageHeaderSkeleton() {
  return (
    <section className="px-6 pt-16 pb-14 md:pt-20 md:pb-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
        <Bar className="h-7 w-40 rounded-full" />
        <Bar className="h-10 w-3/4" />
        <Bar className="h-10 w-1/2" />
        <Bar className="mt-2 h-4 w-2/3" />
        <Bar className="h-4 w-1/2" />
      </div>
    </section>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-line bg-card p-6">
            <Bar className="mb-3 h-4 w-24" />
            <Bar className="mb-2 h-5 w-32" />
            <Bar className="mb-1.5 h-3.5 w-full" />
            <Bar className="mb-5 h-3.5 w-2/3" />
            <Bar className="h-24 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function CtaBannerSkeleton() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl rounded-3xl bg-cream-dim px-8 py-16">
        <div className="mx-auto flex max-w-md flex-col items-center gap-3">
          <Bar className="h-7 w-2/3 bg-line" />
          <Bar className="h-4 w-full bg-line" />
          <div className="mt-4 flex gap-3">
            <Bar className="h-11 w-32 rounded-lg bg-line" />
            <Bar className="h-11 w-28 rounded-lg bg-line" />
          </div>
        </div>
      </div>
    </section>
  );
}
