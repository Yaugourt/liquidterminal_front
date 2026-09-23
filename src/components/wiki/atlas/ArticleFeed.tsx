"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { TableSearch, Pagination, SkeletonGrid, CardHead } from "@/components/common";
import { Card } from "@/components/ui/card";
import { PillTabs } from "@/components/ui/pill-tabs";
import { useWikiLibrary } from "@/services/wiki";
import type { EducationalResource } from "@/services/wiki/types";
import { CONTENT_TYPE_META, CONTENT_TYPE_ORDER, detectContentType, type ContentType } from "../primitives";
import { ArticleCard, xHandleOf } from "../library/ArticleCard";
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
  // Table view stays mounted through loading and 0 results (the table renders
  // both states): swapping trees would remount the search field mid-typing.
  const tableMode = view === "table";
  const showPager = !!pagination && pagination.totalPages > 1 && type === "all";

  // Feed chrome, shared by the table (which owns its card) and the cards view.
  const countTag =
    pagination && !showSkeleton
      ? `${pagination.total} ${pagination.total === 1 ? "resource" : "resources"}`
      : undefined;
  const viewToggle = (
    <PillTabs tabs={VIEW_TABS} activeTab={view} onTabChange={(v) => setView(v as FeedView)} />
  );
  const toolbar = (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <TableSearch
          value={searchQuery}
          onChange={handleSearch}
          debounceMs={300}
          placeholder={searchPlaceholder}
          className="sm:max-w-[240px]"
        />
        <PillTabs
          variant="text"
          tabs={SORT_TABS}
          activeTab={order}
          onTabChange={handleOrder}
          className="ml-auto"
        />
      </div>
      <PillTabs variant="text" tabs={TYPE_TABS} activeTab={type} onTabChange={(v) => setType(v as "all" | ContentType)} />
    </div>
  );
  const emptyText = searchQuery
    ? `No resources match "${searchQuery}"`
    : type !== "all"
      ? `No ${CONTENT_TYPE_META[type].label.toLowerCase()} on this page`
      : "No resources yet";
  const pagerProps =
    showPager && pagination
      ? {
          total: pagination.total,
          page: page - 1,
          rowsPerPage: PAGE_SIZE,
          onPageChange: (zeroBased: number) => setPage(zeroBased + 1),
          onRowsPerPageChange: () => {},
        }
      : undefined;

  if (tableMode) {
    return (
      <AtlasArticleTable
        resources={shown}
        isLoading={isLoading}
        showCategory={showCategory}
        title={title}
        tag={countTag}
        headerAction={viewToggle}
        toolbar={toolbar}
        pagination={pagerProps}
        emptyMessage={emptyText}
      />
    );
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHead title={title} tag={countTag} actions={viewToggle} />
      <div className="flex flex-wrap items-center gap-3 border-b border-border-subtle px-4 py-3">
        {toolbar}
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
            {emptyText}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-3.5 sm:grid-cols-2 2xl:grid-cols-3">
          {shown.map((r) => (
            <ArticleCard
              key={r.id}
              resource={r}
              // Only real tweets (author handle in the URL) get the tweet card:
              // x.com/i/spaces/… are recorded episodes, not posts.
              variant={xHandleOf(r.url) ? "tweet" : "grid"}
            />
          ))}
        </div>
      )}

      {/* Footer: server pagination */}
      {pagerProps && (
        <div className="flex justify-center border-t border-border-subtle px-4 py-2">
          <Pagination {...pagerProps} />
        </div>
      )}
    </Card>
  );
}
