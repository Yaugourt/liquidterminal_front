"use client";

import { motion } from "framer-motion";
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
    <div className="flex flex-wrap items-center gap-2">
      {visible.map((c) => {
        const isActive = value === c;
        const count = c === "all" ? counts.all ?? 0 : counts[c] ?? 0;
        return (
          <motion.button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            whileTap={{ scale: 0.97 }}
            className={`group relative flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isActive
                ? "border-brand-accent/40 bg-brand-accent/10 text-brand-accent"
                : "border-border-subtle bg-transparent text-text-secondary hover:border-border-hover hover:text-white"
            }`}
          >
            <span>{CATEGORY_LABELS[c]}</span>
            <span
              className={`tabular-nums text-[10px] font-bold ${
                isActive ? "text-brand-accent" : "text-text-muted"
              }`}
            >
              {count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
