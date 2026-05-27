"use client";

import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type Hip4Category,
} from "@/lib/hip4-category";

interface Hip4MarketCategoryTabsProps {
  value: Hip4Category;
  onChange: (category: Hip4Category) => void;
  counts: Partial<Record<Hip4Category, number>>;
}

export function Hip4MarketCategoryTabs({ value, onChange, counts }: Hip4MarketCategoryTabsProps) {
  const visible = CATEGORY_ORDER.filter((c) => c === "all" || (counts[c] ?? 0) > 0);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((c) => {
        const isActive = value === c;
        const count = c === "all" ? counts.all ?? 0 : counts[c] ?? 0;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`group flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              isActive
                ? "border-brand/40 bg-brand/10 text-brand"
                : "border-border-subtle bg-transparent text-text-secondary hover:border-border-default hover:text-text-primary"
            }`}
          >
            <span>{CATEGORY_LABELS[c]}</span>
            <span className={`mono text-[10px] font-semibold ${isActive ? "text-brand" : "text-text-tertiary"}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
