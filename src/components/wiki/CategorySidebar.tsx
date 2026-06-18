"use client";

import { Check, Filter, Layers } from "lucide-react";
import { useEducationalCategories } from "@/services/wiki";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

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
    <Card
      interactive={false}
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-surface/80 via-surface/60 to-base/90",
        className,
      )}
      // Using <aside> semantics via asChild pattern is not available; Card renders div.
      // The aside role is preserved implicitly via landmark usage in the parent page.
    >
      {/* Ambient glow, consistent with EducationContent */}
      <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-border-subtle px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-brand/30 bg-brand/10">
            <Filter className="h-3.5 w-3.5 text-brand" />
          </span>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand">
              Filter
            </div>
            <div className="text-sm font-semibold text-text-primary truncate">
              Categories
            </div>
          </div>
        </div>
        {total > 0 && (
          <span className="shrink-0 rounded-full border border-border-subtle bg-base/50 px-2 py-0.5 text-[10px] font-medium tabular-nums text-text-secondary">
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
            "hover:border-border-subtle hover:bg-surface-2 hover:text-text-primary",
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
                ? "border-brand bg-brand"
                : "border-border-default",
            )}
          >
            {allSelected && <Check className="h-3 w-3 text-brand-text-on" />}
          </span>
        </button>
      </div>

      {/* Category list */}
      <div className="relative z-10 max-h-[60vh] overflow-y-auto p-2 pt-1 pr-1 scrollbar-brand lg:max-h-[calc(100vh-18rem)]">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 py-6 text-text-tertiary">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-brand" />
            <span className="text-xs">Loading categories…</span>
          </div>
        ) : total === 0 ? (
          <div className="py-6 text-center text-xs text-text-tertiary">
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
                      "hover:border-border-subtle hover:bg-surface-2",
                      isActive && "bg-surface-2",
                    )}
                  >
                    <span
                      className="truncate text-xs font-medium text-text-secondary transition-colors group-hover:text-text-primary"
                      title={category.name}
                    >
                      {category.name}
                    </span>
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        isActive
                          ? "border-brand bg-brand"
                          : "border-border-default group-hover:border-border-default",
                      )}
                    >
                      {isActive && (
                        <Check className="h-3 w-3 text-brand-text-on" />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Card>
  );
}
