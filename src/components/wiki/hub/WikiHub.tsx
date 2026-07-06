"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEducationalCategories, useWikiLibrary } from "@/services/wiki";
import type { EducationalResource } from "@/services/wiki/types";
import { useHyperliquidEducation } from "@/hooks/useHyperliquidEducation";
import { ArticleCard } from "../library/ArticleCard";
import { buildTopics, subChapterCategoryIds, type WikiTopic } from "./topics";
import { ChapterStrip } from "./ChapterStrip";
import { ThemeBand } from "./ThemeBand";
import { PrimerBand } from "./PrimerBand";
import { TopicRail } from "./TopicRail";
import { ArticleShell } from "./ArticleShell";

const COMMUNITY_CHIPS = 7;
const COMMUNITY_GRID = 4;

interface WikiHubProps {
  /** Bump to force a refetch (after a submission / new content). */
  refreshToken?: number;
}

/**
 * Fused wiki hub (Learn x Library). Home is the curriculum: a "Start here"
 * strip, one band per chapter (primer + its newest community articles) and
 * a community section. Selecting a topic opens the topic view: unified rail,
 * Learn primer, and the article shell filtered to the topic's categories.
 */
export function WikiHub({ refreshToken = 0 }: WikiHubProps) {
  const [topic, setTopic] = useState<WikiTopic | null>(null);
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  const { education, loading: educationLoading } = useHyperliquidEducation();
  const { categories, isLoading: categoriesLoading } = useEducationalCategories({
    limit: 100,
    withCounts: true,
    sortBy: "name",
    sortOrder: "asc",
  });

  // Home content: the whole APPROVED library in one cached sweep (2 requests
  // for ~200 rows), grouped client-side into the chapter bands. The topic
  // view goes back to server-side filtering + pagination.
  const home = useWikiLibrary(
    { page: 1, limit: 100, sort: "createdAt", order: "desc" },
    { refreshToken, fetchAll: true }
  );

  const { chapterTopics, communityCategories } = useMemo(
    () => buildTopics(education?.chapters ?? [], categories),
    [education, categories]
  );

  const totalCount = home.pagination?.total ?? 0;

  const resourcesByChapter = useMemo(() => {
    const map = new Map<number, EducationalResource[]>();
    for (const chapterTopic of chapterTopics) {
      const ids = new Set(chapterTopic.categoryIds);
      map.set(
        chapterTopic.chapter.id,
        home.resources.filter((resource) =>
          resource.categories.some((cat) => ids.has(cat.category.id))
        )
      );
    }
    return map;
  }, [chapterTopics, home.resources]);

  const communityResources = useMemo(() => {
    const mapped = new Set(chapterTopics.flatMap((chapterTopic) => chapterTopic.categoryIds));
    return home.resources.filter(
      (resource) => !resource.categories.some((cat) => mapped.has(cat.category.id))
    );
  }, [chapterTopics, home.resources]);

  const selectTopic = (next: WikiTopic) => {
    setTopic(next);
    setActiveSubId(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };

  const homeLoading =
    (educationLoading || categoriesLoading || home.isLoading) &&
    (chapterTopics.length === 0 || home.resources.length === 0);

  /* ── Topic view ─────────────────────────────────────────────── */
  if (topic) {
    const shellKey =
      topic.kind === "chapter"
        ? `chapter-${topic.chapter.id}-${activeSubId ?? "all"}`
        : topic.kind === "category"
          ? `category-${topic.category.id}`
          : "all";
    const shellCategoryIds =
      topic.kind === "chapter"
        ? subChapterCategoryIds(topic, activeSubId, categories)
        : topic.kind === "category"
          ? [topic.category.id]
          : undefined;
    const shellTitle =
      topic.kind === "chapter"
        ? "Community articles"
        : topic.kind === "category"
          ? topic.category.name
          : "All resources";

    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setTopic(null)}
          className="flex items-center gap-1.5 text-[12px] font-medium text-text-tertiary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All topics
        </button>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <TopicRail
            chapterTopics={chapterTopics}
            communityCategories={communityCategories}
            totalCount={totalCount}
            selected={topic}
            onSelect={selectTopic}
            className="min-w-0 lg:sticky lg:top-4 lg:self-start"
          />

          <div className="min-w-0 space-y-4">
            {topic.kind === "chapter" && (
              <PrimerBand topic={topic} activeSubId={activeSubId} onSubChange={setActiveSubId} />
            )}
            <ArticleShell
              key={shellKey}
              categoryIds={shellCategoryIds}
              title={shellTitle}
              refreshToken={refreshToken}
            />
          </div>
        </div>
      </div>
    );
  }

  /* ── Home: the curriculum ───────────────────────────────────── */
  return (
    <div className="space-y-6">
      <ChapterStrip topics={chapterTopics} onSelect={selectTopic} isLoading={homeLoading} />

      {homeLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded-lg border border-border-subtle bg-surface" />
          ))}
        </div>
      ) : (
        chapterTopics.map((chapterTopic) => (
          <ThemeBand
            key={chapterTopic.chapter.id}
            topic={chapterTopic}
            resources={resourcesByChapter.get(chapterTopic.chapter.id) ?? []}
            onOpen={selectTopic}
          />
        ))
      )}

      {/* Community: everything the curriculum does not claim */}
      {!homeLoading && (
        <section className="space-y-3">
          <div className="flex items-baseline gap-2 px-1">
            <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
              Community
            </h2>
            <span className="text-[11px] text-text-tertiary">
              ecosystem, alpha and culture · {communityResources.length} resources
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {communityCategories.slice(0, COMMUNITY_CHIPS).map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => selectTopic({ kind: "category", category })}
                className={cn(
                  "rounded-md border border-border-subtle bg-surface px-2.5 py-1 text-[11.5px] text-text-secondary transition-colors hover:text-text-primary"
                )}
              >
                {category.name}{" "}
                <span className="mono text-text-tertiary">{category.resourcesCount ?? 0}</span>
              </button>
            ))}
            {communityCategories.length > COMMUNITY_CHIPS && (
              <button
                type="button"
                onClick={() => selectTopic({ kind: "all" })}
                className="rounded-md px-2 py-1 text-[11.5px] text-text-tertiary transition-colors hover:text-text-primary"
              >
                + {communityCategories.length - COMMUNITY_CHIPS} more
              </button>
            )}
          </div>
          <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
            <div className="grid grid-cols-1 gap-px bg-border-subtle lg:grid-cols-2">
              {communityResources.slice(0, COMMUNITY_GRID).map((resource) => (
                <ArticleCard key={resource.id} resource={resource} variant="compact" />
              ))}
              {communityResources.length === 0 && (
                <p className="bg-surface px-4 py-6 text-[11.5px] text-text-tertiary lg:col-span-2">
                  No community resource yet.
                </p>
              )}
            </div>
            <div className="flex items-center justify-center border-t border-border-subtle px-4 py-2.5">
              <button
                type="button"
                onClick={() => selectTopic({ kind: "all" })}
                className="flex items-center gap-1 text-[11.5px] font-medium text-brand transition-colors hover:text-brand-hover"
              >
                Browse all resources
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
