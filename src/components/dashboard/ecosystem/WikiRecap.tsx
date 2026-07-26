"use client";

import { memo } from "react";
import Link from "next/link";
import { OverviewModule, ModuleRow, Skeleton } from "@/components/common";
import { usePublicReadLists } from "@/services/wiki/readList/hooks/usePublicReadLists";
import { useEducationalCategories } from "@/services/wiki";
import { slugify, categoryHref } from "@/components/wiki/hub/topics";
import { PopularArticlesModule } from "./PopularArticlesModule";

const POPULAR_SHOWN = 5;
const READLISTS_SHOWN = 4;
const TOPICS_SHOWN = 8;

function RailSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-2 p-3.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full rounded-md" />
      ))}
    </div>
  );
}

/**
 * WikiRecap — the editorial half of the Dashboard's Ecosystem scope.
 *
 * Projects and the wiki are the two curated contents of the terminal (both
 * live in the Content DB), so they share a scope: what this ecosystem is,
 * facing the scopes that answer how much it moves.
 *
 * Known limit: nothing links a project to its article in the DB today, so
 * these are neighbouring modules rather than one joined view.
 */
export const WikiRecap = memo(function WikiRecap() {
  const { readLists, loading: readListsLoading } = usePublicReadLists({
    limit: READLISTS_SHOWN,
    sort: "updatedAt",
    order: "desc",
  });
  const { categories, isLoading: categoriesLoading } = useEducationalCategories();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
      <PopularArticlesModule limit={POPULAR_SHOWN} className="lg:col-span-2 min-w-0" />

      <div className="min-w-0 space-y-4">
        {/* Public read lists */}
        <OverviewModule
          title="Public read lists"
          viewAllLabel="All"
          href="/wiki/readlists"
        >
          {readListsLoading && readLists.length === 0 ? (
            <RailSkeleton rows={2} />
          ) : readLists.length === 0 ? (
            <p className="px-3.5 py-4 text-[11.5px] text-text-tertiary">
              No public list yet.
            </p>
          ) : (
            readLists.slice(0, READLISTS_SHOWN).map((list, index) => (
              <Link
                key={list.id}
                href={`/wiki/readlists/${slugify(list.name)}-${list.id}`}
                className="block"
              >
                <ModuleRow
                  rank={index + 1}
                  logo={
                    <span className="grid h-full w-full place-items-center text-[9px] font-semibold uppercase">
                      {list.name.slice(0, 2)}
                    </span>
                  }
                  name={list.name}
                  sub={`by ${list.creator.name}`}
                  stats={[{ value: `${list.itemsCount} items`, width: 64 }]}
                />
              </Link>
            ))
          )}
        </OverviewModule>

        {/* Topics */}
        <OverviewModule
          title="Topics"
          tag={categories.length > 0 ? String(categories.length) : undefined}
          tagVariant="plain"
          viewAllLabel="All topics"
          href="/wiki/topics"
        >
          {categoriesLoading && categories.length === 0 ? (
            <RailSkeleton rows={2} />
          ) : (
            <div className="px-3.5 py-3 flex flex-wrap gap-2">
              {categories.slice(0, TOPICS_SHOWN).map((category) => (
                <Link
                  key={category.id}
                  href={categoryHref(category.name)}
                  className="inline-flex items-center text-[11px] px-2 py-0.5 rounded-md bg-surface-2 border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default transition-colors"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </OverviewModule>
      </div>
    </div>
  );
});
