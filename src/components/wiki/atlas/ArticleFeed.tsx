"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { SearchBar, Pagination, SkeletonGrid } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { useWikiLibrary } from "@/services/wiki";
import type { EducationalResource } from "@/services/wiki/types";
import { CONTENT_TYPE_META, CONTENT_TYPE_ORDER, detectContentType, type ContentType } from "../primitives";
import { AtlasArticleCard } from "./AtlasArticleCard";
import { AtlasArticleTable } from "./AtlasArticleTable";

const PAGE_SIZE = 24;

type FeedView = "cards" | "table";

const VIEW_TABS = [
  { value: "cards", label: "Cards" },
  { value: "table", label: "Table" },
];

const SORT_TABS = [
  { value: "desc", label: "Newest" },
  { value: "asc", label: "Oldest" },
];

// Type tabs carry NO counts (the API has no type field yet); "All" is real.
const TYPE_TABS = [
  { value: "all", label: "All" },
  ...CONTENT_TYPE_ORDER.map((t) => ({ value: t, label: CONTENT_TYPE_META[t].label })),
];

interface ArticleFeedProps {
  /** Server-side category filter; undefined = every APPROVED resource. */
  categoryIds?: number[];
  /** Left-side title in the toolbar. */
  title?: string;
  /** Default view. Community/topic tails default to "table". */
  defaultView?: FeedView;
  /** Table shows a category column. */
  showCategory?: boolean;
  /** Search placeholder. */
  searchPlaceholder?: string;
  /** Initial search query (e.g. driven by the home front door). */
  defaultSearch?: string;
  /** Bump to force a refetch (after a submission). */
  refreshToken?: number;
}

/**
 * Atlas article feed shell: content-type PillTabs (uncounted, client-side
 * filter over the loaded page until the API gains a type field), Cards/Table
 * switch, search, Newest/Oldest sort, server pagination. Mount with a `key`
 * per topic so filters reset when the scope changes.
 */
export function ArticleFeed({
  categoryIds,
  title = "Latest across the wiki",
  defaultView = "cards",
  showCategory = false,
  searchPlaceholder = "Search resources",
  defaultSearch = "",
  refreshToken = 0,
}: ArticleFeedProps) {
  const [searchQuery, setSearchQuery] = useState(defaultSearch);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [view, setView] = useState<FeedView>(defaultView);
  const [type, setType] = useState<"all" | ContentType>("all");
  const [page, setPage] = useState(1);

  const { resources, pagination, isLoading } = useWikiLibrary(
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

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPage(1);
  };
  const handleOrder = (v: string) => {
    setOrder(v as "asc" | "desc");
    setPage(1);
  };

  // Type filter is client-side over the current page (URL-derived, honest);
  // becomes a server query when the resource type field ships.
  const shown: EducationalResource[] = useMemo(() => {
    if (type === "all") return resources;
    return resources.filter((r) => detectContentType(r.url) === type);
  }, [resources, type]);

  const showSkeleton = isLoading && resources.length === 0;

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-border-subtle bg-surface">
      <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-3.5 py-3">
        <span className="text-[13px] font-semibold text-text-primary">{title}</span>
        <PillTabs tabs={VIEW_TABS} activeTab={view} onTabChange={(v) => setView(v as FeedView)} />
        <SearchBar
          onSearch={handleSearch}
          initialValue={defaultSearch}
          placeholder={searchPlaceholder}
          className="min-w-[160px] flex-1 sm:max-w-[240px]"
        />
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <PillTabs variant="text" tabs={SORT_TABS} activeTab={order} onTabChange={handleOrder} />
          {pagination && !showSkeleton && (
            <span className="hidden text-[11px] text-text-tertiary sm:inline">
              <span className="mono">{pagination.total}</span>{" "}
              {pagination.total === 1 ? "resource" : "resources"}
            </span>
          )}
        </div>
      </div>

      {/* Content-type filter row */}
      <div className="border-b border-border-subtle px-3.5 py-2">
        <PillTabs variant="text" tabs={TYPE_TABS} activeTab={type} onTabChange={(v) => setType(v as "all" | ContentType)} />
      </div>

      {/* Body */}
      {showSkeleton ? (
        <div className="p-4">
          <SkeletonGrid count={8} columns="grid-cols-1 lg:grid-cols-2" gap="gap-3" lines={2} />
        </div>
      ) : shown.length === 0 ? (
        <div className="py-16 text-center">
          <SearchX className="mx-auto mb-3 h-8 w-8 text-text-tertiary/60" />
          <p className="text-sm text-text-secondary">
            {searchQuery
              ? `No resources match "${searchQuery}"`
              : type !== "all"
                ? `No ${CONTENT_TYPE_META[type].label.toLowerCase()} on this page`
                : "No resources yet"}
          </p>
        </div>
      ) : view === "table" ? (
        <AtlasArticleTable resources={shown} isLoading={isLoading} showCategory={showCategory} />
      ) : (
        <div className="grid grid-cols-1 gap-px bg-border-subtle lg:grid-cols-2">
          {shown.map((r) => (
            <AtlasArticleCard key={r.id} resource={r} />
          ))}
          {shown.length % 2 === 1 && <div className="hidden bg-surface lg:block" />}
        </div>
      )}

      {/* Footer: server pagination */}
      {pagination && pagination.totalPages > 1 && type === "all" && (
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
