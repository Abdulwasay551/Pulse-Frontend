export default function LogoTicker({ logos }: { logos: string[] }) {
  const items = [...logos, ...logos];

  return (
    <section className="border-y border-line bg-card py-10">
      <p className="mb-6 text-center font-mono text-xs uppercase tracking-wide text-ink-soft">
        Trusted by recruiting teams at
      </p>
      <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-ticker gap-16">
          {items.map((logo, i) => (
            <span
              key={`${logo}-${i}`}
              className="font-display text-lg font-semibold whitespace-nowrap text-ink-soft/70"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
