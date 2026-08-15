export default function BrandLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10">
      <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="#0a2e36" />
        <rect
          className="animate-loader-bounce"
          x="7"
          y="18"
          width="4.5"
          height="8"
          rx="1.5"
          fill="#73b6c4"
          style={{ animationDelay: "0ms" }}
        />
        <rect
          className="animate-loader-bounce"
          x="13.75"
          y="13"
          width="4.5"
          height="13"
          rx="1.5"
          fill="#73b6c4"
          style={{ animationDelay: "150ms" }}
        />
        <rect
          className="animate-loader-bounce"
          x="20.5"
          y="7"
          width="4.5"
          height="19"
          rx="1.5"
          fill="#ff6b35"
          style={{ animationDelay: "300ms" }}
        />
      </svg>
      <span className="text-xs uppercase tracking-wide text-ink-soft">{label}…</span>
    </div>
  );
}
