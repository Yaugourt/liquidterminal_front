"use client";

import type { ChapterTopic } from "./topics";

interface ChapterStripProps {
  topics: ChapterTopic[];
  onSelect: (topic: ChapterTopic) => void;
  isLoading?: boolean;
}

/**
 * "Start here" strip of the hub home: the 7 curriculum chapters as
 * horizontally scrollable cards (icon, tagline, article count).
 */
export function ChapterStrip({ topics, onSelect, isLoading = false }: ChapterStripProps) {
  return (
    <section className="space-y-2">
      <div className="flex items-baseline gap-2 px-1">
        <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-text-secondary">
          Start here
        </h2>
        <span className="text-[11px] text-text-tertiary">
          the Hyperliquid curriculum, {topics.length || 7} chapters
        </span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isLoading && topics.length === 0
          ? Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-[120px] w-[210px] shrink-0 animate-pulse rounded-lg bg-surface-2" />
            ))
          : topics.map((topic) => {
              const Icon = topic.icon;
              return (
                <button
                  key={topic.chapter.id}
                  type="button"
                  onClick={() => onSelect(topic)}
                  className="w-[210px] shrink-0 rounded-lg border border-border-subtle bg-surface p-3.5 text-left transition-colors hover:border-border-default"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="grid h-7 w-7 place-items-center rounded-md bg-brand/10 text-brand">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="mono text-[10px] text-text-tertiary">
                      {String(topic.chapter.id).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold text-text-primary">{topic.chapter.title}</div>
                  <div className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-text-tertiary">
                    {topic.meta.tagline}
                  </div>
                  <div className="mono mt-2 text-[10.5px] text-text-tertiary">
                    {topic.articleCount} {topic.articleCount === 1 ? "article" : "articles"}
                  </div>
                </button>
              );
            })}
      </div>
    </section>
  );
}
