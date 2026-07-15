"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EducationalCategory } from "@/services/wiki/types";
import { chapterHref, categoryHref, type ChapterTopic } from "../hub/topics";
import { SUBCHAPTER_CATEGORY_MAP } from "../hub/topics";
import { RailSearch } from "../primitives";

const COMMUNITY_TOP = 8;

interface WikiRailProps {
  chapterTopics: ChapterTopic[];
  communityCategories: EducationalCategory[];
  categories: EducationalCategory[];
  /** Active target: a chapter id, a category id, or none. */
  active: { kind: "chapter"; chapterId: number; subId?: string } | { kind: "category"; categoryId: number } | null;
  className?: string;
}

/**
 * Shared wiki navigation rail (topic views): a RailSearch filter, then
 * FUNDAMENTALS (the Learn chapters, active chapter expands its HIP-1/2/3
 * sub-rows) and COMMUNITY (top categories + a terminal "All N categories"
 * link to /wiki/topics). No "Show N more" toggle: the tail is typed.
 */
export function WikiRail({
  chapterTopics,
  communityCategories,
  categories,
  active,
  className,
}: WikiRailProps) {
  const [filter, setFilter] = useState("");
  const byName = new Map(categories.map((c) => [c.name, c]));

  const q = filter.trim().toLowerCase();
  const chapters = useMemo(
    () => (q ? chapterTopics.filter((t) => t.chapter.title.toLowerCase().includes(q)) : chapterTopics),
    [chapterTopics, q]
  );
  const communities = useMemo(() => {
    const list = q
      ? communityCategories.filter((c) => c.name.toLowerCase().includes(q))
      : communityCategories.slice(0, COMMUNITY_TOP);
    return list;
  }, [communityCategories, q]);

  const chapterActive = (id: number) => active?.kind === "chapter" && active.chapterId === id;

  return (
    <nav aria-label="Wiki topics" className={className}>
      <RailSearch value={filter} onChange={setFilter} placeholder="Filter topics" className="mb-3" />

      <div className="mb-1 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        Fundamentals
      </div>
      <div className="space-y-0.5">
        {chapters.map((topic) => {
          const Icon = topic.icon;
          const isActive = chapterActive(topic.chapter.id);
          const subs = isActive ? topic.chapter.subChapters ?? [] : [];
          return (
            <div key={topic.chapter.id} className={cn(isActive && subs.length > 0 && "rounded-lg bg-surface-2/40 pb-1")}>
              <Link
                href={chapterHref(topic.chapter.title)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors",
                  isActive
                    ? "font-medium text-text-primary"
                    : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 text-brand/70" />
                <span className="flex-1 truncate">{topic.chapter.title}</span>
                <span className="mono shrink-0 text-[11px] text-text-tertiary">{topic.articleCount}</span>
              </Link>
              {subs.map((sub) => {
                const names = SUBCHAPTER_CATEGORY_MAP[sub.id] ?? [];
                const count = names.reduce((s, n) => s + (byName.get(n)?.resourcesCount ?? 0), 0);
                const subActive = active?.kind === "chapter" && active.subId === sub.id;
                return (
                  <Link
                    key={sub.id}
                    href={chapterHref(topic.chapter.title, sub.id)}
                    className={cn(
                      "mx-2 flex items-center gap-2 rounded-md px-3 py-1.5 text-[12px] transition-colors",
                      subActive
                        ? "border border-brand/30 bg-brand/10 font-medium text-brand"
                        : "text-text-secondary hover:text-text-primary"
                    )}
                  >
                    <span className="flex-1 truncate">{sub.title}</span>
                    <span className={cn("mono shrink-0 text-[11px]", subActive ? "text-brand/80" : "text-text-tertiary")}>
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="mb-1 mt-4 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">
        Community
      </div>
      <div className="space-y-0.5">
        {communities.map((cat) => {
          const isActive = active?.kind === "category" && active.categoryId === cat.id;
          return (
            <Link
              key={cat.id}
              href={categoryHref(cat.name)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors",
                isActive
                  ? "border border-brand/30 bg-brand/10 font-medium text-brand"
                  : "text-text-secondary hover:bg-surface-2 hover:text-text-primary"
              )}
            >
              <span className="truncate">{cat.name}</span>
              <span className={cn("mono shrink-0 text-[11px]", isActive ? "text-brand/80" : "text-text-tertiary")}>
                {cat.resourcesCount ?? 0}
              </span>
            </Link>
          );
        })}
        {!q && (
          <Link
            href="/wiki/topics"
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-[12px] text-text-tertiary transition-colors hover:text-text-primary"
          >
            {/* Count what the topics page actually lists: community categories. */}
            All {communityCategories.length > 0 ? `${communityCategories.length} ` : ""}categories{" "}
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </nav>
  );
}
