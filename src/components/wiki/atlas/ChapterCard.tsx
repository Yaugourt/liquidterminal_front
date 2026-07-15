"use client";

import Link from "next/link";
import { chapterHref, type ChapterTopic } from "../hub/topics";
import { SUBCHAPTER_CATEGORY_MAP } from "../hub/topics";
import type { EducationalCategory } from "@/services/wiki/types";

interface ChapterCardProps {
  topic: ChapterTopic;
  categories: EducationalCategory[];
}

/**
 * Curriculum chapter card of the Atlas home: icon, "CHAPTER NN" overline,
 * title, tagline, article count. HIP Framework additionally lists its
 * HIP-1/2/3 sub-rows with counts. Links to the chapter route.
 */
export function ChapterCard({ topic, categories }: ChapterCardProps) {
  const Icon = topic.icon;
  const subs = topic.chapter.subChapters ?? [];
  const byName = new Map(categories.map((c) => [c.name, c]));

  const subRows = subs
    .map((sub) => {
      const names = SUBCHAPTER_CATEGORY_MAP[sub.id] ?? [];
      const count = names.reduce((sum, n) => sum + (byName.get(n)?.resourcesCount ?? 0), 0);
      return { sub, count };
    })
    .filter((r) => r.count > 0);

  const body = (
    <div className="flex h-full flex-col rounded-lg border border-border-subtle bg-surface p-3.5 transition-colors hover:border-border-default">
      <div className="mb-2 flex items-center justify-between">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-surface-2 text-brand">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <span className="mono text-[10px] uppercase tracking-[0.1em] text-text-tertiary">
          Chapter {String(topic.chapter.id).padStart(2, "0")}
        </span>
      </div>
      <div className="text-[13px] font-medium text-text-primary">{topic.chapter.title}</div>
      <div className="mt-0.5 text-[11.5px] leading-snug text-text-tertiary">{topic.meta.tagline}</div>

      {subRows.length > 0 && (
        <div className="mt-2.5 space-y-1 border-t border-border-subtle pt-2">
          {subRows.map(({ sub, count }) => (
            <div key={sub.id} className="flex items-center justify-between text-[12px] text-text-secondary">
              <span className="truncate">{sub.title}</span>
              <span className="mono shrink-0 text-[11px] text-text-tertiary">{count}</span>
            </div>
          ))}
        </div>
      )}

      <div className="mono mt-auto pt-2.5 text-[10.5px] text-text-tertiary">
        {topic.articleCount} {topic.articleCount === 1 ? "article" : "articles"}
      </div>
    </div>
  );

  return (
    <Link href={chapterHref(topic.chapter.title)} className="block">
      {body}
    </Link>
  );
}
