"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { EducationalCategory } from "@/services/wiki/types";
import type { ChapterTopic, WikiTopic } from "./topics";

const COMMUNITY_PREVIEW = 8;

interface TopicRailProps {
  chapterTopics: ChapterTopic[];
  communityCategories: EducationalCategory[];
  totalCount: number;
  selected: WikiTopic;
  onSelect: (topic: WikiTopic) => void;
  className?: string;
}

function isChapterSelected(selected: WikiTopic, topic: ChapterTopic): boolean {
  return selected.kind === "chapter" && selected.chapter.id === topic.chapter.id;
}

/**
 * Unified navigation of the topic view: the Learn chapters (Fundamentals)
 * followed by the community categories. Vertical sticky on lg+, horizontal
 * scroll strip below.
 */
export function TopicRail({
  chapterTopics,
  communityCategories,
  totalCount,
  selected,
  onSelect,
  className,
}: TopicRailProps) {
  const [showAllCommunity, setShowAllCommunity] = useState(false);
  const community = showAllCommunity
    ? communityCategories
    : communityCategories.slice(0, COMMUNITY_PREVIEW);

  const item = (
    key: string,
    label: React.ReactNode,
    count: number | undefined,
    isActive: boolean,
    onClick: () => void
  ) => (
    <button
      key={key}
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors",
        "lg:w-full lg:justify-between",
        isActive
          ? "border-brand/30 bg-brand/10 font-medium text-brand"
          : "border-transparent text-text-secondary hover:border-border-subtle hover:bg-surface-2 hover:text-text-primary"
      )}
    >
      <span className="flex min-w-0 items-center gap-2 truncate">{label}</span>
      {count !== undefined && (
        <span
          className={cn(
            "mono shrink-0 text-[11px] tabular-nums",
            isActive ? "text-brand/80" : "text-text-tertiary"
          )}
        >
          {count}
        </span>
      )}
    </button>
  );

  return (
    <nav aria-label="Wiki topics" className={className}>
      <div
        className={cn(
          "flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "lg:max-h-[calc(100vh-140px)] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0 lg:pr-1"
        )}
      >
        <div className="mb-1 hidden px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary lg:block">
          Fundamentals
        </div>
        {chapterTopics.map((topic) => {
          const Icon = topic.icon;
          return item(
            `chapter-${topic.chapter.id}`,
            <>
              <Icon className="h-3.5 w-3.5 shrink-0 text-brand/70" />
              <span className="truncate">{topic.chapter.title}</span>
            </>,
            topic.articleCount,
            isChapterSelected(selected, topic),
            () => onSelect(topic)
          );
        })}

        <div className="mb-1 mt-3 hidden px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary lg:block">
          Community
        </div>
        {item(
          "all",
          "All resources",
          totalCount,
          selected.kind === "all",
          () => onSelect({ kind: "all" })
        )}
        {community.map((category) =>
          item(
            `category-${category.id}`,
            category.name,
            category.resourcesCount,
            selected.kind === "category" && selected.category.id === category.id,
            () => onSelect({ kind: "category", category })
          )
        )}
        {communityCategories.length > COMMUNITY_PREVIEW && (
          <button
            type="button"
            onClick={() => setShowAllCommunity((value) => !value)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-left text-[11.5px] text-text-tertiary transition-colors hover:text-text-primary"
          >
            {showAllCommunity
              ? "Show less"
              : `Show ${communityCategories.length - COMMUNITY_PREVIEW} more…`}
          </button>
        )}
      </div>
    </nav>
  );
}
