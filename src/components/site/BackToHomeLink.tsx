import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToHomeLink() {
  return (
    <Link
      href="/"
      className="absolute top-6 left-6 z-10 flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
    >
      <ArrowLeft className="h-3.5 w-3.5" />
      Back to homepage
    </Link>
  );
}
