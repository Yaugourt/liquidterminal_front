"use client";

import { useEffect, useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { KpiRibbon, SearchBar, Pagination, SkeletonGrid, type KpiCell } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import {
  useEducationalCategories,
  useWikiLibrary,
  useDeleteEducationalResource,
} from "@/services/wiki";
import { ArticleCard } from "./ArticleCard";
import { CategoryRail } from "./CategoryRail";
import { LibrarySideRail } from "./LibrarySideRail";
import { LibraryTable } from "./LibraryTable";

const PAGE_SIZE = 24;

type LibraryView = "cards" | "table";

const VIEW_TABS = [
  { value: "cards", label: "Cards" },
  { value: "table", label: "Table" },
];

const SORT_TABS = [
  { value: "desc", label: "Latest" },
  { value: "asc", label: "Oldest" },
];

interface WikiLibraryProps {
  /** Bump to force a refetch (after a submission / new content). */
  refreshToken?: number;
}

/**
 * Library tab of the wiki hub, command-center layout: KPI ribbon, category
 * rail, one card-shell with a Cards/Table view switch (Builders language),
 * and a side rail (most saved / recently added / read lists shortcut).
 * Listing stays server-driven: one request per view.
 */
export function WikiLibrary({ refreshToken = 0 }: WikiLibraryProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<LibraryView>("cards");
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

  // Ribbon: real counts only (no fabricated deltas — the API has no history).
  const kpiCells: KpiCell[] = useMemo(() => {
    const topCategory = [...categories].sort(
      (a, b) => (b.resourcesCount ?? 0) - (a.resourcesCount ?? 0)
    )[0];
    return [
      {
        key: "resources",
        label: "Resources",
        value: allTotal > 0 ? allTotal : "…",
        sub: "approved · public",
      },
      {
        key: "categories",
        label: "Categories",
        value: categoriesLoading && categories.length === 0 ? "…" : categories.length,
      },
      {
        key: "top-category",
        label: "Top category",
        value: topCategory ? (
          <span className="font-sans text-[17px] font-semibold">{topCategory.name}</span>
        ) : (
          "…"
        ),
        sub: topCategory?.resourcesCount !== undefined
          ? `${topCategory.resourcesCount} resources`
          : undefined,
      },
    ];
  }, [categories, categoriesLoading, allTotal]);

  const showSkeleton = isLoading && resources.length === 0;

  return (
    <div className="space-y-4">
      <KpiRibbon variant="plain" cells={kpiCells} columns="grid-cols-1 sm:grid-cols-3" />

      {/* 3 zones: category rail · (card-shell · side rail) — nested 2-col grids */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[220px_minmax(0,1fr)]">
        <CategoryRail
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelect={selectCategory}
          totalCount={allTotal}
          isLoading={categoriesLoading}
          className="min-w-0 xl:sticky xl:top-4 xl:self-start"
        />

        <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        {/* Card-shell: view switch + search + sort in the header (Builders language) */}
        <div className="min-w-0 overflow-hidden rounded-lg border border-border-subtle bg-surface">
          <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-3.5 py-3">
            <PillTabs
              tabs={VIEW_TABS}
              activeTab={view}
              onTabChange={(value) => setView(value as LibraryView)}
            />
            <SearchBar
              onSearch={handleSearch}
              placeholder="Search title, description or URL..."
              className="min-w-[180px] flex-1 sm:max-w-xs"
            />
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <PillTabs
                variant="text"
                tabs={SORT_TABS}
                activeTab={order}
                onTabChange={handleOrderChange}
              />
              {pagination && !showSkeleton && (
                <span className="hidden text-[11px] text-text-tertiary sm:inline">
                  <span className="mono">{pagination.total}</span>{" "}
                  {pagination.total === 1 ? "resource" : "resources"}
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          {showSkeleton ? (
            <div className="p-4">
              <SkeletonGrid count={8} columns="grid-cols-1 lg:grid-cols-2" gap="gap-3" lines={2} />
            </div>
          ) : resources.length === 0 ? (
            <div className="py-16 text-center">
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
          ) : view === "table" ? (
            <LibraryTable resources={resources} isLoading={isLoading} />
          ) : (
            <div className="grid grid-cols-1 gap-px bg-border-subtle lg:grid-cols-2">
              {resources.map((resource) => (
                <ArticleCard
                  key={resource.id}
                  resource={resource}
                  variant="compact"
                  onDelete={handleDelete}
                  isDeleting={isDeleting}
                />
              ))}
              {/* Filler keeps the divider grid clean when the count is odd. */}
              {resources.length % 2 === 1 && <div className="hidden bg-surface lg:block" />}
            </div>
          )}

          {/* Footer: server pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center border-t border-border-subtle px-4 py-2">
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

        <LibrarySideRail
          refreshToken={refreshToken}
          className="min-w-0 xl:sticky xl:top-4 xl:self-start"
        />
        </div>
      </div>
    </div>
  );
}
