import type { TrustLogo } from "@/lib/cms";

export default function LogoTicker({ logos }: { logos: TrustLogo[] }) {
  const items = [...logos, ...logos];

  return (
    <section className="border-y border-line bg-card py-10">
      <p className="mb-6 text-center font-mono text-xs uppercase tracking-wide text-ink-soft">
        Trusted by recruiting teams at
      </p>
      <div className="overflow-hidden [-webkit-mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="flex w-max animate-ticker items-center gap-16">
          {items.map((logo, i) => {
            const src = logo.logo_upload || logo.logo_url;
            return (
              <span
                key={`${logo.name}-${i}`}
                role="img"
                aria-label={logo.name}
                title={logo.name}
                className="h-7 w-28 shrink-0 bg-ink-soft/60 transition-colors hover:bg-ink-soft"
                style={{
                  maskImage: `url(${src})`,
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskImage: `url(${src})`,
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  WebkitMaskSize: "contain",
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
