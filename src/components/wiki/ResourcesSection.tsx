"use client";

import { ResourceCard } from "./ResourceCard";
import { Button } from "@/components/ui/button";
import { SkeletonGrid } from "@/components/common";
import { useState, useCallback, useEffect } from "react";
import { useEducationalCategories } from "@/services/wiki";
import { useEducationalResourcesByCategories } from "@/services/wiki/hooks/useEducationalResourcesByCategories";
import { useDeleteEducationalResource } from "@/services/wiki";
import { EducationalCategory, EducationalResource, EducationalResourceCategory } from "@/services/wiki/types";
import { toast } from "sonner";

interface ResourcesSectionProps {
  selectedCategoryIds: number[];
  sectionColor: string;
  searchQuery?: string;
}

export function ResourcesSection({ selectedCategoryIds, sectionColor, searchQuery = "" }: ResourcesSectionProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<number, number>>({});

  // Fetch categories and resources using the education service
  const { categories: serverCategories, isLoading: categoriesLoading } = useEducationalCategories();
  const { resources: serverResources, isLoading: resourcesLoading, refetch: refetchResources } = useEducationalResourcesByCategories(selectedCategoryIds);

  // Local state for optimistic updates
  const [localCategories, setLocalCategories] = useState<EducationalCategory[]>([]);
  const [localResources, setLocalResources] = useState<EducationalResource[]>([]);

  // Delete resource hook
  const { deleteResource, isLoading: isDeleting } = useDeleteEducationalResource();

  // Synchronize local state with server data
  useEffect(() => {
    if (serverCategories.length > 0) {
      setLocalCategories(serverCategories);
    }
  }, [serverCategories]);

  useEffect(() => {
    if (serverResources.length > 0) {
      setLocalResources(serverResources);
    }
  }, [serverResources]);

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

  // Handle resource deletion with optimistic update
  const handleDeleteResource = useCallback(async (resourceId: number) => {
    // Optimistic update - remove from local state immediately
    setLocalResources(prev => prev.filter(resource => resource.id !== resourceId));

    try {
      const success = await deleteResource(resourceId);
      if (success) {
        // Refresh the resources list in background
        refetchResources();
      } else {
        // If deletion failed, revert the optimistic update
        setLocalResources(prev => [...prev, serverResources.find(r => r.id === resourceId)!].filter(Boolean));
        toast.error('Failed to delete resource');
      }
    } catch {
      // If deletion failed, revert the optimistic update
      setLocalResources(prev => [...prev, serverResources.find(r => r.id === resourceId)!].filter(Boolean));
      // Error handled silently
      toast.error('Failed to delete resource');
    }
  }, [deleteResource, refetchResources, serverResources]);



  // Helper function to check if resource matches search query
  const matchesSearch = (resource: EducationalResource, categoryName: string) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const searchableText = [
      resource.url.toLowerCase(),
      categoryName.toLowerCase(),
      resource.categories.map(cat => cat.category.name).join(' ').toLowerCase()
    ].join(' ');

    return searchableText.includes(query);
  };

  // Group resources by category using local state
  const categoriesWithResources = localCategories
    .filter(cat => selectedCategoryIds.length > 0 && selectedCategoryIds.includes(cat.id))
    .map(category => {
      const categoryResources = localResources
        .filter(resource =>
          resource.categories.some((resCat: EducationalResourceCategory) => resCat.category.id === category.id) &&
          matchesSearch(resource, category.name)
        )
        .map((resource: EducationalResource) => ({
          id: resource.id.toString(),
          title: resource.url,
          description: resource.categories.map((cat: EducationalResourceCategory) => cat.category.name).join(', '),
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
      <SkeletonGrid
        count={6}
        columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
        gap="gap-5"
        lines={2}
      />
    );
  }

  if (categoriesWithResources.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-base/40 py-16 text-center">
        <p className="text-sm text-text-tertiary">
          Select at least one category to see resources.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">

      {categoriesWithResources.map((category) => {
        const displayCount = expandedCategories[category.id] || 6;
        const displayedResources = category.resources.slice(0, displayCount);
        const hasMore = displayCount < category.resources.length;
        const canShowLess = displayCount > 6;

        return (
          <div key={category.id}>
            {/* Category header */}
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <h2 className="truncate text-lg font-semibold tracking-tight text-text-primary">
                  {category.title}
                </h2>
                <span className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[11px] font-medium text-gold">
                  {category.resources.length} {category.resources.length === 1 ? "resource" : "resources"}
                </span>
              </div>
              <div className="hidden h-px flex-1 bg-gradient-to-r from-border-subtle to-transparent sm:block" />
            </div>

            {/* Resources grid — tuned for both full-width (no sidebar) and lg+ sidebar layouts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {displayedResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  categoryColor={sectionColor}
                  onDelete={handleDeleteResource}
                  isDeleting={isDeleting}
                />
              ))}
            </div>

            {/* Show more/less buttons */}
            {(hasMore || canShowLess) && (
              <div className="mt-8 flex justify-center gap-3">
                {canShowLess && (
                  <Button
                    onClick={() => handleShowLess(category.id)}
                    variant="outline"
                    className="border-border-subtle bg-base/40 text-text-secondary hover:border-border-default hover:bg-surface-2 hover:text-text-primary"
                  >
                    Show less
                  </Button>
                )}
                {hasMore && (
                  <Button
                    onClick={() => handleShowMore(category.id)}
                    className="bg-brand font-medium text-brand-text-on hover:bg-brand/90"
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