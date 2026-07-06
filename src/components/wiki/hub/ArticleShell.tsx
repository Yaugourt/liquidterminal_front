"use client";

import { useState } from "react";
import { SearchX } from "lucide-react";
import { SearchBar, Pagination, SkeletonGrid } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { useWikiLibrary, useDeleteEducationalResource } from "@/services/wiki";
import { ArticleCard } from "../library/ArticleCard";
import { LibraryTable } from "../library/LibraryTable";

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

interface ArticleShellProps {
  /** Server-side category filter; undefined = every APPROVED resource. */
  categoryIds?: number[];
  /** Label on the left of the shell header (e.g. "Community articles"). */
  title?: string;
  /** Bump to force a refetch (after a submission). */
  refreshToken?: number;
}

/**
 * The article card-shell of the hub (Builders language): Cards/Table view
 * switch, search, Latest/Oldest sort and server pagination in one card.
 * Mount with a `key` per topic so filters reset when the topic changes.
 */
export function ArticleShell({ categoryIds, title = "Community articles", refreshToken = 0 }: ArticleShellProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<LibraryView>("cards");
  const [page, setPage] = useState(1);

  const { resources, pagination, isLoading, refetch } = useWikiLibrary(
    {
      categoryIds,
      search: searchQuery || undefined,
      page,
      limit: PAGE_SIZE,
      sort: "createdAt",
      order,
    },
    { refreshToken }
  );

  const { deleteResource, isLoading: isDeleting } = useDeleteEducationalResource();

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
    <div className="min-w-0 overflow-hidden rounded-lg border border-border-subtle bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-3.5 py-3">
        <span className="text-[13px] font-semibold text-text-primary">{title}</span>
        <PillTabs
          tabs={VIEW_TABS}
          activeTab={view}
          onTabChange={(value) => setView(value as LibraryView)}
        />
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search title, description or URL..."
          className="min-w-[180px] flex-1 sm:max-w-[260px]"
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
            {searchQuery ? `No resources match "${searchQuery}"` : "No resources on this topic yet"}
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
  );
}
