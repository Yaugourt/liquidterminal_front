"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { DEFAULT_SUB_META } from "../education-meta";
import { excerpt, type ChapterTopic } from "./topics";
import { Hypurr } from "@/components/hypurr/Hypurr";

interface PrimerBandProps {
  topic: ChapterTopic;
  /** Active sub-chapter id (e.g. "hip-3"), null for the whole chapter. */
  activeSubId: string | null;
  onSubChange: (subId: string | null) => void;
}

/**
 * Learn primer of a selected chapter (topic hub view): breadcrumb, tagline,
 * description (expandable to the full chapter text), key stats, and pills to
 * switch between sub-chapters (HIP-1/2/3).
 */
export function PrimerBand({ topic, activeSubId, onSubChange }: PrimerBandProps) {
  const [expanded, setExpanded] = useState(false);

  const subChapters = topic.chapter.subChapters ?? [];
  const activeSub = subChapters.find((sub) => sub.id === activeSubId) ?? null;

  const { title, tagline, description, stats } = useMemo(() => {
    if (activeSub) {
      const subMeta = topic.meta.subChapters?.[activeSub.id] ?? DEFAULT_SUB_META;
      return {
        title: activeSub.title + (activeSub.subtitle ? ` · ${activeSub.subtitle}` : ""),
        tagline: activeSub.subtitle ?? topic.meta.tagline,
        description: activeSub.description,
        stats: subMeta.stats,
      };
    }
    return {
      title: topic.chapter.title,
      tagline: topic.meta.tagline,
      description: topic.chapter.description,
      stats: topic.meta.stats,
    };
  }, [topic, activeSub]);

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
      <div className="bg-[linear-gradient(120deg,rgba(131,233,255,0.07),transparent_60%)] p-5 sm:p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
          <span className="uppercase tracking-[0.12em]">
            Chapter {String(topic.chapter.id).padStart(2, "0")}
          </span>
          <span>·</span>
          <span>Learn curriculum</span>
          {subChapters.length > 0 && (
            <span className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSubChange(null)}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[11px] transition-colors",
                  activeSubId === null
                    ? "border-brand/40 bg-brand/10 font-medium text-brand"
                    : "border-border-subtle bg-surface-2 text-text-secondary hover:text-text-primary"
                )}
              >
                All
              </button>
              {subChapters.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => onSubChange(sub.id)}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[11px] transition-colors",
                    activeSubId === sub.id
                      ? "border-brand/40 bg-brand/10 font-medium text-brand"
                      : "border-border-subtle bg-surface-2 text-text-secondary hover:text-text-primary"
                  )}
                >
                  {sub.title}
                </button>
              ))}
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-inter text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
              {title}
            </h2>
            <p className="mt-1 text-[12.5px] font-medium text-brand/90">{tagline}</p>
          </div>
          <Hypurr
            mood="purrfessor"
            height={60}
            className="hidden shrink-0 sm:block"
            title="The purrfessor walks you through this chapter"
          />
        </div>
        <p
          className={cn(
            "mt-3 max-w-3xl text-[13px] leading-relaxed text-text-secondary",
            expanded && "whitespace-pre-line"
          )}
        >
          {expanded ? description : excerpt(description, 280)}
        </p>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-2 text-[12px] font-medium text-brand transition-colors hover:text-brand-hover"
        >
          {expanded ? "Collapse the primer" : "Read the full primer →"}
        </button>
      </div>

      {stats.length > 0 && (
        <div
          className={cn(
            "grid divide-x divide-border-subtle border-t border-border-subtle",
            stats.length >= 3 ? "grid-cols-3" : "grid-cols-2"
          )}
        >
          {stats.slice(0, 3).map((stat) => (
            <div key={stat.label} className="px-5 py-3">
              <div className="truncate text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                {stat.label}
              </div>
              <div className="mono mt-1 text-[17px] font-medium text-text-primary">{stat.value}</div>
              {stat.hint && <div className="text-[10.5px] text-text-tertiary">{stat.hint}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
