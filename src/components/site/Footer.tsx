import Link from "next/link";
import Logo from "./Logo";
import { sv, type SiteSettingsData } from "@/lib/cms";

export default function Footer({ settings }: { settings: SiteSettingsData }) {
  const columns = sv(settings.footer_columns);

  return (
    <footer className="border-t border-line bg-cream-dim px-6 pt-16 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-10 pb-12 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <Logo className="h-7 w-7" />
              EvoHR
            </div>
            <p className="mt-3 max-w-[220px] text-sm text-ink-soft">{settings.footer_tagline}</p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="mb-4 font-mono text-xs font-semibold uppercase tracking-wide text-ink-soft">
                {col.heading}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href={col.url}
                      className="font-sans text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-line pt-6 font-sans text-sm text-ink-soft sm:flex-row">
          <span>
            © {new Date().getFullYear()} {settings.copyright_holder}
          </span>
          <div className="flex gap-5">
            <Link href="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-ink">
              Terms
            </Link>
            <Link href="/pricing" className="hover:text-ink">
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
