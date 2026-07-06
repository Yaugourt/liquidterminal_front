"use client";

import { ArrowRight } from "lucide-react";
import type { EducationalResource } from "@/services/wiki/types";
import { excerpt, type ChapterTopic } from "./topics";
import { ArticleRow } from "./ArticleRow";

const BAND_ROWS = 4;

interface ThemeBandProps {
  topic: ChapterTopic;
  /** Newest-first articles of this theme (already grouped by the hub). */
  resources: EducationalResource[];
  onOpen: (topic: ChapterTopic) => void;
}

/**
 * One curriculum band of the hub home: the chapter primer card on the left
 * (sticky), its newest community articles on the right.
 */
export function ThemeBand({ topic, resources, onOpen }: ThemeBandProps) {
  const Icon = topic.icon;
  const stats = topic.meta.stats.slice(0, 2);
  const rows = resources.slice(0, BAND_ROWS);

  return (
    <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* Primer card */}
      <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface lg:sticky lg:top-4">
        <div className="bg-[linear-gradient(135deg,rgba(131,233,255,0.07),transparent_65%)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-brand/10 text-brand">
              <Icon className="h-4 w-4" />
            </span>
            <span className="mono text-[10px] uppercase tracking-[0.1em] text-text-tertiary">
              Chapter {String(topic.chapter.id).padStart(2, "0")}
            </span>
          </div>
          <h3 className="font-inter text-[17px] font-semibold text-text-primary">{topic.chapter.title}</h3>
          <p className="mt-0.5 text-[12px] font-medium text-brand/90">{topic.meta.tagline}</p>
          <p className="mt-2 text-[12px] leading-relaxed text-text-secondary">
            {excerpt(topic.chapter.description, 150)}
          </p>
        </div>
        {stats.length > 0 && (
          <div className="grid grid-cols-2 divide-x divide-border-subtle border-t border-border-subtle">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-2.5">
                <div className="text-[9.5px] uppercase tracking-[0.08em] text-text-tertiary">{stat.label}</div>
                <div className="mono text-[15px] font-medium text-text-primary">{stat.value}</div>
              </div>
            ))}
          </div>
        )}
        <div className="border-t border-border-subtle p-3">
          <button
            type="button"
            onClick={() => onOpen(topic)}
            className="h-8 w-full rounded-md bg-brand text-xs font-semibold text-brand-text-on transition-colors hover:bg-brand/90"
          >
            Read the primer →
          </button>
        </div>
      </div>

      {/* Newest articles of the theme */}
      <div className="min-w-0 overflow-hidden rounded-lg border border-border-subtle bg-surface">
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
          <span className="text-[12px] font-medium text-text-secondary">
            Latest on {topic.chapter.title}
          </span>
          <button
            type="button"
            onClick={() => onOpen(topic)}
            className="flex items-center gap-1 text-[11px] text-text-tertiary transition-colors hover:text-text-primary"
          >
            View all <span className="mono">{topic.articleCount}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-6 text-[11.5px] text-text-tertiary">
            No community article on this chapter yet. Suggest the first one.
          </p>
        ) : (
          rows.map((resource, index) => (
            <ArticleRow
              key={resource.id}
              resource={resource}
              className={index < rows.length - 1 ? "border-b border-border-subtle/60" : ""}
            />
          ))
        )}
      </div>
    </section>
  );
}
