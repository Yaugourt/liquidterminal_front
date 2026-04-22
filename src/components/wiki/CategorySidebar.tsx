"use client";

import { Check, Filter, Layers } from "lucide-react";
import { useEducationalCategories } from "@/services/wiki";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  selectedCategories: number[];
  onCategoryChange: (categories: number[]) => void;
  className?: string;
}

/**
 * Always-expanded vertical category filter for large screens.
 *
 * Shares its API with {@link CategoryFilter} so the page-level selection
 * state can be reused without changes. Visually aligned with
 * `EducationContent` — gradient bg, ambient glow, rounded-2xl, brand-accent
 * highlights — to keep the wiki page feeling like a single coherent surface.
 */
export function CategorySidebar({
  selectedCategories,
  onCategoryChange,
  className,
}: CategorySidebarProps) {
  const { categories, isLoading } = useEducationalCategories({ limit: 100 });

  const total = categories.length;
  const allSelected =
    total > 0 && categories.every((cat) => selectedCategories.includes(cat.id));
  const selectedCount = selectedCategories.filter((id) =>
    categories.some((cat) => cat.id === id),
  ).length;

  const handleToggle = (categoryId: number) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      onCategoryChange([]);
    } else {
      onCategoryChange(categories.map((cat) => cat.id));
    }
  };

  return (
    <aside
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border-subtle",
        "bg-gradient-to-br from-[#111826]/80 via-brand-secondary/60 to-[#0B0E14]/90",
        "shadow-xl shadow-black/20",
        className,
      )}
    >
      {/* Ambient glow, consistent with EducationContent */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-brand-accent/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-brand-accent/30 bg-brand-accent/10">
            <Filter className="h-3.5 w-3.5 text-brand-accent" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-accent">
              Filter
            </div>
            <div className="text-sm font-semibold text-white truncate">
              Categories
            </div>
          </div>
        </div>
        {total > 0 && (
          <span className="shrink-0 rounded-full border border-border-subtle bg-brand-dark/50 px-2 py-0.5 text-[10px] font-medium tabular-nums text-text-secondary">
            {selectedCount}/{total}
          </span>
        )}
      </div>

      {/* Select all */}
      <div className="relative z-10 px-2 pt-2">
        <button
          type="button"
          onClick={handleSelectAll}
          disabled={isLoading || total === 0}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-text-secondary transition-colors",
            "hover:border-border-subtle hover:bg-white/5 hover:text-white",
            (isLoading || total === 0) && "cursor-not-allowed opacity-50",
          )}
        >
          <span className="flex items-center gap-2 min-w-0">
            <Layers className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs font-medium">
              {allSelected ? "Deselect all" : "Select all"}
            </span>
          </span>
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
              allSelected
                ? "border-white/80 bg-white/90"
                : "border-border-hover",
            )}
          >
            {allSelected && <Check className="h-3 w-3 text-brand-tertiary" />}
          </span>
        </button>
      </div>

      {/* Category list */}
      <div className="relative z-10 max-h-[60vh] overflow-y-auto p-2 pt-1 lg:max-h-[calc(100vh-18rem)]">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 py-6 text-text-muted">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-brand-accent" />
            <span className="text-xs">Loading categories…</span>
          </div>
        ) : total === 0 ? (
          <div className="py-6 text-center text-xs text-text-muted">
            No categories available
          </div>
        ) : (
          <ul className="space-y-1">
            {categories.map((category) => {
              const isActive = selectedCategories.includes(category.id);
              return (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => handleToggle(category.id)}
                    aria-pressed={isActive}
                    className={cn(
                      "group flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-3 py-2 text-left transition-colors",
                      "hover:border-border-subtle hover:bg-white/5",
                      isActive && "bg-white/[0.03]",
                    )}
                  >
                    <span
                      className="truncate text-xs font-medium text-text-secondary transition-colors group-hover:text-white"
                      title={category.name}
                    >
                      {category.name}
                    </span>
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        isActive
                          ? "border-white/80 bg-white/90"
                          : "border-border-hover group-hover:border-white/40",
                      )}
                    >
                      {isActive && (
                        <Check className="h-3 w-3 text-brand-tertiary" />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
