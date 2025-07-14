"use client";

import { ResourceCard } from "./ResourceCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
}

interface Category {
  id: number;
  title: string;
  count: number;
  resources: Resource[];
}

interface ResourcesSectionProps {
  categories: Category[];
  sectionColor: string;
}

export function ResourcesSection({ categories, sectionColor }: ResourcesSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<number, number>>({});

  const handleShowMore = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: (prev[categoryId] || 4) + 4
    }));
  };

  const handleShowLess = (categoryId: number) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: 4
    }));
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No resources found for the selected categories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categories.map((category) => {
        const displayCount = expandedCategories[category.id] || 4;
        const displayedResources = category.resources.slice(0, displayCount);
        const hasMore = displayCount < category.resources.length;
        const canShowLess = displayCount > 4;

        return (
          <div key={category.id}>
            {/* Category header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">{category.title}</h2>
                <span className="px-3 py-1 bg-[#F9E37020] text-[#F9E370] rounded-full text-xs font-medium">
                  {category.resources.length} resources
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-[#83E9FF4D] hover:border-[#83E9FF80] text-white hover:bg-[#83E9FF20] transition-all"
              >
                <Plus size={16} className="mr-2 text-[#F9E370]" />
                Add resource
              </Button>
            </div>

            {/* Resources grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedResources.map((resource) => (
                <ResourceCard 
                  key={resource.id} 
                  resource={resource} 
                  categoryColor={sectionColor}
                />
              ))}
            </div>

            {/* Show more/less buttons */}
            {(hasMore || canShowLess) && (
              <div className="flex justify-center mt-8 gap-4">
                {canShowLess && (
                  <Button
                    onClick={() => handleShowLess(category.id)}
                    variant="outline"
                    className="border-[#83E9FF4D] hover:border-[#83E9FF80] text-white hover:bg-[#83E9FF20]"
                  >
                    Show less
                  </Button>
                )}
                {hasMore && (
                  <Button
                    onClick={() => handleShowMore(category.id)}
                    className="bg-[#83E9FF] hover:bg-[#6bd4f0] text-[#051728] font-medium"
                  >
                    Show more
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 