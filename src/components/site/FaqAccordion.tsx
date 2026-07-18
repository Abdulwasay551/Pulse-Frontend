"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/cms";

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="mx-auto max-w-2xl">
      {items.map((item, i) => {
        const isOpen = i === openIndex;
        return (
          <div key={item.question} className="border-b border-line">
            <button
              onClick={() => setOpenIndex(isOpen ? -1 : i)}
              className="flex w-full items-center justify-between gap-4 py-5 text-left font-display text-base font-semibold text-ink"
            >
              <span>{item.question}</span>
              <span
                className={`shrink-0 font-sans text-xl text-primary transition-transform ${isOpen ? "rotate-45" : ""}`}
              >
                +
              </span>
            </button>
            <div
              className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
              style={{ maxHeight: isOpen ? "220px" : "0px" }}
            >
              <p className="max-w-xl pb-5 text-sm text-ink-soft">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
