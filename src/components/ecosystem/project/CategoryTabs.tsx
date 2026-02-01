import { memo } from "react";
import { cn } from "@/lib/utils";
import { Category } from "@/services/ecosystem/project/types";

interface CategoryTabsProps {
  categories: Category[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export const CategoryTabs = memo(function CategoryTabs({ 
  categories, 
  activeTab, 
  onTabChange, 
  isLoading = false, 
  error = null 
}: CategoryTabsProps) {

  if (isLoading) {
    return (
      <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle w-fit max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-20 bg-white/5 rounded-md animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center w-full">
        <div className="text-rose-400 text-sm py-2 px-3">
          Failed to load categories: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle gap-1 w-fit max-w-full overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {/* Tab "All" */}
      <button
        onClick={() => onTabChange('all')}
        className={cn(
          "flex-shrink-0 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
          "px-2.5 sm:px-4",
          activeTab === 'all'
            ? "bg-brand-accent text-brand-tertiary shadow-sm font-bold"
            : "tab-inactive"
        )}
      >
        All Projects
      </button>
      
      {/* Category tabs */}
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onTabChange(category.id.toString())}
          className={cn(
            "flex-shrink-0 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap",
            "px-2 sm:px-3",
            activeTab === category.id.toString()
              ? "bg-brand-accent text-brand-tertiary shadow-sm font-bold"
              : "tab-inactive"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
});
