"use client";

import { ResourceCard } from "./ResourceCard";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useEducationalCategories } from "@/services/education";
import { useEducationalResourcesByCategories } from "@/services/education/hooks/useEducationalResourcesByCategories";

interface ResourcesSectionProps {
  selectedCategoryIds: number[];
  sectionColor: string;
}

export function ResourcesSection({ selectedCategoryIds, sectionColor }: ResourcesSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<number, number>>({});
  
  // Fetch categories and resources using the education service
  const { categories: allCategories, isLoading: categoriesLoading } = useEducationalCategories();
  const { resources, isLoading: resourcesLoading } = useEducationalResourcesByCategories(selectedCategoryIds);

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

  // Group resources by category
  const categoriesWithResources = allCategories
    .filter(cat => selectedCategoryIds.length === 0 || selectedCategoryIds.includes(cat.id))
    .map(category => {
      const categoryResources = resources
        .filter(resource => resource.categories.some((resCat: any) => resCat.category.id === category.id))
        .map((resource: any) => ({
          id: resource.id.toString(),
          title: resource.url,
          description: resource.categories.map((cat: any) => cat.category.name).join(', '),
          url: resource.url,
          image: '/api/placeholder/400/200' // Default image since API doesn't provide images
        }));
      
      return {
        id: category.id,
        title: category.name,
        count: categoryResources.length,
        resources: categoryResources
      };
    })
    .filter(cat => cat.resources.length > 0);

  if (categoriesLoading || resourcesLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Loading resources...</p>
      </div>
    );
  }

  if (categoriesWithResources.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No resources found for the selected categories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {categoriesWithResources.map((category) => {
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