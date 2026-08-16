"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

/** Pairs with usePagination — a Prev/Next + page-number footer, styled to
 * sit directly under a `.eh-table`'s closing border. Renders nothing for a
 * single-page result set, so pages with few records look exactly as they
 * did before adopting pagination. */
export default function PaginationFooter({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  // Keep the page-number row short even with dozens of pages: current page
  // plus a couple of neighbors on each side, first/last always visible,
  // "…" filling any gap.
  const pages: (number | "…")[] = [];
  const window = 1;
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= window) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
      <span className="text-xs text-ink-soft">
        {from}–{to} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1.5 text-xs text-ink-soft">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`min-w-[28px] rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                p === page ? "bg-primary text-cream" : "text-ink-soft hover:bg-cream-dim hover:text-ink"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="rounded-lg p-1.5 text-ink-soft transition-colors hover:bg-cream-dim hover:text-ink disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
