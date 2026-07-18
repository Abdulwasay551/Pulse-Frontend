export default function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <section className="px-6 pt-16 pb-14 md:pt-20 md:pb-16">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-1.5 font-mono text-xs uppercase tracking-wide text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
          {eyebrow}
        </div>
        <h1 className="font-display text-4xl font-bold leading-tight text-ink md:text-5xl">
          {title}
        </h1>
        {subtitle && <p className="mx-auto mt-5 max-w-xl text-lg text-ink-soft">{subtitle}</p>}
      </div>
    </section>
  );
}
