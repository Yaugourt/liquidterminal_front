"use client";

import { useEffect, useState } from "react";
import { SearchX } from "lucide-react";
import { SearchBar, Pagination, SkeletonGrid } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import {
  useEducationalCategories,
  useWikiLibrary,
  useDeleteEducationalResource,
} from "@/services/wiki";
import { ArticleCard } from "./ArticleCard";
import { CategoryRail } from "./CategoryRail";

const PAGE_SIZE = 24;

const SORT_TABS = [
  { value: "desc", label: "Latest" },
  { value: "asc", label: "Oldest" },
];

interface WikiLibraryProps {
  /** Bump to force a refetch (after a submission / new content). */
  refreshToken?: number;
}

/**
 * Library tab of the wiki hub: category rail (APPROVED counts), server-side
 * search and sort, paginated article grid. One request per view.
 */
export function WikiLibrary({ refreshToken = 0 }: WikiLibraryProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  // Stable "All resources" count: captured from the unfiltered listing total.
  const [allTotal, setAllTotal] = useState(0);

  const { categories, isLoading: categoriesLoading } = useEducationalCategories({
    limit: 100,
    withCounts: true,
    sortBy: "name",
    sortOrder: "asc",
  });

  const { resources, pagination, isLoading, refetch } = useWikiLibrary(
    {
      categoryIds: selectedCategoryId !== null ? [selectedCategoryId] : undefined,
      search: searchQuery || undefined,
      page,
      limit: PAGE_SIZE,
      sort: "createdAt",
      order,
    },
    { refreshToken }
  );

  const { deleteResource, isLoading: isDeleting } = useDeleteEducationalResource();

  useEffect(() => {
    if (selectedCategoryId === null && !searchQuery && pagination) {
      setAllTotal(pagination.total);
    }
  }, [selectedCategoryId, searchQuery, pagination]);

  // Any filter change goes back to the first page.
  const selectCategory = (id: number | null) => {
    setSelectedCategoryId(id);
    setPage(1);
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };
  const handleOrderChange = (value: string) => {
    setOrder(value as "asc" | "desc");
    setPage(1);
  };

  const handleDelete = async (resourceId: number) => {
    const success = await deleteResource(resourceId);
    if (success) refetch();
  };

  const showSkeleton = isLoading && resources.length === 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
      <CategoryRail
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelect={selectCategory}
        totalCount={allTotal}
        isLoading={categoriesLoading}
        className="min-w-0 lg:sticky lg:top-4 lg:self-start"
      />

      <div className="min-w-0 space-y-5">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search title, description or URL..."
            className="w-full sm:max-w-[380px]"
          />
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {pagination && !showSkeleton && (
              <span className="text-xs text-text-tertiary">
                {pagination.total} {pagination.total === 1 ? "resource" : "resources"}
              </span>
            )}
            <PillTabs tabs={SORT_TABS} activeTab={order} onTabChange={handleOrderChange} />
          </div>
        </div>

        {/* Grid */}
        {showSkeleton ? (
          <SkeletonGrid
            count={9}
            columns="grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
            gap="gap-4"
            lines={2}
          />
        ) : resources.length === 0 ? (
          <div className="rounded-lg border border-border-subtle bg-base/40 py-16 text-center">
            <SearchX className="mx-auto mb-3 h-8 w-8 text-text-tertiary/60" />
            <p className="text-sm text-text-secondary">
              {searchQuery ? `No resources match "${searchQuery}"` : "No resources in this category yet"}
            </p>
            {searchQuery && (
              <button
                onClick={() => handleSearch("")}
                className="mt-3 text-sm text-brand transition-colors hover:text-brand/80"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <ArticleCard
                key={resource.id}
                resource={resource}
                onDelete={handleDelete}
                isDeleting={isDeleting}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center pt-1">
            <Pagination
              total={pagination.total}
              page={page - 1}
              rowsPerPage={PAGE_SIZE}
              onPageChange={(zeroBased) => setPage(zeroBased + 1)}
              onRowsPerPageChange={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
