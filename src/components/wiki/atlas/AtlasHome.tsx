"use client";

import { useMemo, useState } from "react";
import { KpiRibbon, type KpiCell } from "@/components/common";
import { useEducationalCategories, useWikiLibrary } from "@/services/wiki";
import { usePublicReadLists } from "@/services/wiki/readList/hooks/usePublicReadLists";
import { useHyperliquidEducation } from "@/hooks/useHyperliquidEducation";
import { buildTopics } from "../hub/topics";
import { RailSearch } from "../primitives";
import { CurriculumGrid } from "./CurriculumGrid";
import { ArticleFeed } from "./ArticleFeed";
import { HomeRail } from "./HomeRail";

interface AtlasHomeProps {
  /** Bump to force a refetch (after a submission / new content). */
  refreshToken?: number;
}

/**
 * Atlas home (/wiki): search front door, KPI ribbon, curriculum grid,
 * the "Latest across the wiki" feed with content-type tabs, and a right
 * rail (read lists + most saved).
 */
export function AtlasHome({ refreshToken = 0 }: AtlasHomeProps) {
  const [frontDoor, setFrontDoor] = useState("");
  const [feedSearch, setFeedSearch] = useState("");

  const { education, loading: educationLoading } = useHyperliquidEducation();
  const { categories, isLoading: categoriesLoading } = useEducationalCategories({
    limit: 100,
    withCounts: true,
    sortBy: "name",
    sortOrder: "asc",
  });
  // One cheap request purely for the real total.
  const { pagination } = useWikiLibrary({ page: 1, limit: 1, sort: "createdAt", order: "desc" }, { refreshToken });
  const { readLists, pagination: readListsPag, loading: readListsLoading } = usePublicReadLists({ limit: 5 });

  const { chapterTopics, communityCategories } = useMemo(
    () => buildTopics(education?.chapters ?? [], categories),
    [education, categories]
  );

  const totalResources = pagination?.total ?? 0;
  const totalReadLists = readListsPag?.total ?? readLists.length;

  const kpiCells: KpiCell[] = useMemo(
    () => [
      { key: "resources", label: "Resources", value: totalResources > 0 ? totalResources : "…", sub: "approved" },
      {
        // Community categories only: the rest of the taxonomy is folded into
        // the Learn chapters, so this matches what the rails actually list.
        key: "categories",
        label: "Categories",
        value: categoriesLoading && communityCategories.length === 0 ? "…" : communityCategories.length,
        sub: "community",
      },
      {
        key: "chapters",
        label: "Chapters",
        value: chapterTopics.length || "…",
        sub: "Learn curriculum",
      },
      { key: "readlists", label: "Read lists", value: totalReadLists, sub: totalReadLists > 0 ? "community" : "start yours" },
    ],
    [totalResources, communityCategories.length, categoriesLoading, chapterTopics.length, totalReadLists]
  );

  const submitFrontDoor = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedSearch(frontDoor.trim());
  };

  return (
    <div className="space-y-5">
      {/* Front door */}
      <form
        onSubmit={submitFrontDoor}
        className="rounded-lg border border-border-subtle bg-surface p-3.5"
      >
        <RailSearch
          value={frontDoor}
          onChange={setFrontDoor}
          placeholder={
            totalResources > 0 && communityCategories.length > 0
              ? `Search ${totalResources} resources, ${communityCategories.length} categories, chapters and read lists`
              : "Search resources, categories, chapters and read lists"
          }
          size="lg"
          keycap
        />
        <p className="mt-2 text-[10px] text-text-tertiary">
          Press Enter to search the library. Grouped search across chapters and read lists is on the way.
        </p>
      </form>

      {/* KPI ribbon */}
      <KpiRibbon variant="plain" cells={kpiCells} columns="grid-cols-2 sm:grid-cols-4" />

      {/* Two columns: curriculum + feed | rail */}
      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 space-y-5">
          <CurriculumGrid
            topics={chapterTopics}
            categories={categories}
            isLoading={educationLoading || categoriesLoading}
          />
          <ArticleFeed
            key={feedSearch}
            title="Latest across the wiki"
            defaultView="cards"
            defaultSearch={feedSearch}
            searchPlaceholder="Search resources"
            refreshToken={refreshToken}
          />
        </div>

        <HomeRail readLists={readLists} readListsLoading={readListsLoading} />
      </div>
    </div>
  );
}
