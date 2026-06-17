"use client";

import { memo, useMemo } from "react";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Skeleton } from "@/components/common";
import { Category } from "@/services/ecosystem/project/types";

interface CategoryTabsProps {
  categories: Category[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

/**
 * Category filter for /ecosystem/project — built on the V4 `<PillTabs>`
 * primitive (boxed track + animated brand indicator). "All Projects" + one
 * tab per backend category.
 */
export const CategoryTabs = memo(function CategoryTabs({
  categories,
  activeTab,
  onTabChange,
  isLoading = false,
  error = null,
}: CategoryTabsProps) {
  const tabs = useMemo(
    () => [
      { value: "all", label: "All Projects" },
      ...categories.map((category) => ({
        value: category.id.toString(),
        label: category.name,
      })),
    ],
    [categories]
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 w-fit max-w-full">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger text-sm py-2 px-3">
        Failed to load categories: {error.message}
      </div>
    );
  }

  return (
    <PillTabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
  );
});
