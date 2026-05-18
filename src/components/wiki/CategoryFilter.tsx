"use client";

import { ChevronDown, Check, Filter } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useEducationalCategories } from "@/services/wiki";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  selectedCategories: number[];
  onCategoryChange: (categories: number[]) => void;
  className?: string;
}

/**
 * Collapsible dropdown variant of the category filter. Used on screens
 * where a persistent left sidebar would crowd the layout. Shares the
 * same selection API as {@link CategorySidebar}.
 */
export function CategoryFilter({
  selectedCategories,
  onCategoryChange,
  className,
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { categories, isLoading } = useEducationalCategories({ limit: 100 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const total = categories.length;
  const allSelected =
    total > 0 && categories.every((cat) => selectedCategories.includes(cat.id));
  const selectedCount = selectedCategories.filter((id) =>
    categories.some((cat) => cat.id === id),
  ).length;

  const handleToggleCategory = (categoryId: number) => {
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

  const getButtonText = () => {
    if (isLoading) return "Loading categories…";
    if (total === 0) return "No categories";
    if (selectedCategories.length === 0) return "Select categories";
    if (allSelected) return "All categories";
    if (selectedCount === 1) {
      const only = categories.find((c) => selectedCategories.includes(c.id));
      return only?.name ?? "1 category";
    }
    return `${selectedCount} categories selected`;
  };

  return (
    <div
      className={cn("relative w-full sm:w-80", className)}
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        disabled={isLoading || total === 0}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left transition-all",
          "bg-surface/40",
          isOpen
            ? "border-brand/50 shadow-[0_0_15px_-3px_rgba(131,233,255,0.15)]"
            : "border-border-subtle hover:border-border-default",
          (isLoading || total === 0) && "cursor-not-allowed opacity-70",
        )}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Filter className="h-4 w-4 shrink-0 text-brand" />
          <span className="truncate text-sm font-medium text-text-primary">
            {getButtonText()}
          </span>
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {total > 0 && (
            <span className="rounded-full border border-border-subtle bg-base/50 px-2 py-0.5 text-[10px] font-medium tabular-nums text-text-secondary">
              {selectedCount}/{total}
            </span>
          )}
          <ChevronDown
            size={16}
            className={cn(
              "text-brand transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </span>
      </button>

      {isOpen && !isLoading && total > 0 && (
        <div
          className={cn(
            "absolute top-full z-50 mt-2 w-full overflow-hidden rounded-lg border border-border-subtle",
            "bg-gradient-to-br from-surface/95 via-surface/90 to-base/95",
            "shadow-xl shadow-black/30 backdrop-blur-md",
          )}
        >
          {/* Select All */}
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex w-full items-center justify-between gap-2 border-b border-border-subtle px-4 py-3 text-left text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            <span className="text-xs font-semibold uppercase tracking-wider">
              {allSelected ? "Deselect all" : "Select all"}
            </span>
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded border transition-colors",
                allSelected
                  ? "border-white/80 bg-white/90"
                  : "border-border-default",
              )}
            >
              {allSelected && <Check size={12} className="text-brand-text-on" />}
            </span>
          </button>

          {/* Options */}
          <div className="max-h-64 overflow-y-auto p-1 pr-0.5 scrollbar-brand">
            {categories.map((category) => {
              const isActive = selectedCategories.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleToggleCategory(category.id)}
                  className={cn(
                    "group flex w-full items-center justify-between gap-2 rounded-lg border border-transparent px-3 py-2 text-left transition-colors",
                    "hover:border-border-subtle hover:bg-white/5",
                    isActive && "bg-white/[0.03]",
                  )}
                >
                  <span className="truncate text-sm font-medium text-text-secondary transition-colors group-hover:text-text-primary">
                    {category.name}
                  </span>
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                      isActive
                        ? "border-white/80 bg-white/90"
                        : "border-border-default group-hover:border-white/40",
                    )}
                  >
                    {isActive && (
                      <Check size={12} className="text-brand-text-on" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
