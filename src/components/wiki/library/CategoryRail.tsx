"use client";

import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EducationalCategory } from "@/services/wiki/types";

interface CategoryRailProps {
  categories: EducationalCategory[];
  /** null selects "All". */
  selectedCategoryId: number | null;
  onSelect: (categoryId: number | null) => void;
  totalCount: number;
  isLoading?: boolean;
  className?: string;
}

/**
 * Single-select category rail of the wiki library.
 * Vertical sticky list on lg+, horizontal scroll strip below.
 * Counts come from GET /educational/categories?withCounts=true (APPROVED only).
 */
export function CategoryRail({
  categories,
  selectedCategoryId,
  onSelect,
  totalCount,
  isLoading = false,
  className,
}: CategoryRailProps) {
  const sorted = [...categories].sort(
    (a, b) => (b.resourcesCount ?? 0) - (a.resourcesCount ?? 0) || a.name.localeCompare(b.name)
  );

  const item = (
    id: number | null,
    label: string,
    count: number | undefined
  ) => {
    const isActive = selectedCategoryId === id;
    return (
      <button
        key={id ?? "all"}
        type="button"
        onClick={() => onSelect(id)}
        className={cn(
          "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors",
          "lg:w-full lg:justify-between",
          isActive
            ? "border-brand/30 bg-brand/10 font-medium text-brand"
            : "border-transparent text-text-secondary hover:border-border-subtle hover:bg-surface-2 hover:text-text-primary"
        )}
      >
        <span className="truncate">{label}</span>
        {count !== undefined && (
          <span
            className={cn(
              "mono shrink-0 text-[11px] tabular-nums",
              isActive ? "text-brand/80" : "text-text-tertiary"
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <nav aria-label="Resource categories" className={className}>
      <div className="mb-2 hidden items-center gap-2 px-1 lg:flex">
        <Layers className="h-3.5 w-3.5 text-brand" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
          Categories
        </span>
      </div>

      <div
        className={cn(
          "flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "lg:max-h-[calc(100vh-180px)] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0 lg:pr-1"
        )}
      >
        {item(null, "All resources", totalCount)}
        {isLoading && categories.length === 0
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-9 w-28 shrink-0 animate-pulse rounded-lg bg-surface-2 lg:w-full" />
            ))
          : sorted.map((cat) => item(cat.id, cat.name, cat.resourcesCount))}
      </div>
    </nav>
  );
}
