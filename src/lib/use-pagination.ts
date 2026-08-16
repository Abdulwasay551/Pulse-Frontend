"use client";

import { useEffect, useMemo, useState } from "react";

/** Client-side pagination for an already-loaded list — slices `items` into
 * pages of `pageSize`. Resets to page 1 whenever the list's length changes
 * (a new search/sort/filter narrows or widens the result set) so a page
 * number from a longer list can't strand the user on a now-empty page. */
export function usePagination<T>(items: T[], pageSize = 25) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  const safePage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize]
  );

  return { pageItems, page: safePage, setPage, totalPages, pageSize, total: items.length };
}
