"use client";

import Link from "next/link";
import { ArrowRight, Beaker, LineChart, ShieldCheck, Server, type LucideIcon } from "lucide-react";
import type { ChapterTopic } from "../hub/topics";
import type { EducationalCategory } from "@/services/wiki/types";
import { ChapterCard } from "./ChapterCard";

interface CurriculumGridProps {
  topics: ChapterTopic[];
  categories: EducationalCategory[];
  isLoading?: boolean;
}

/**
 * Plausible future chapters, shown only under a labeled "SCALED PREVIEW"
 * strip to prove the 7 -> 15 curriculum growth stays a compact index.
 */
const PREVIEW_CHAPTERS: { id: number; title: string; tagline: string; icon: LucideIcon }[] = [
  { id: 8, title: "HyperEVM DeFi", tagline: "Lending, LSTs and the app layer on HyperEVM", icon: Beaker },
  { id: 9, title: "Trading", tagline: "Order types, funding and execution on the CLOB", icon: LineChart },
  { id: 10, title: "Security essentials", tagline: "OPSEC, custody and safe on-chain habits", icon: ShieldCheck },
  { id: 11, title: "Validator operations", tagline: "Running a node and staking mechanics", icon: Server },
];

export function CurriculumGrid({ topics, categories, isLoading = false }: CurriculumGridProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[13px] font-semibold text-text-primary">Curriculum</h2>
          <span className="text-[11px] text-text-tertiary">the {topics.length || 7} Learn chapters</span>
        </div>
        <Link
          href="/wiki/topics"
          className="flex items-center gap-1 text-[11px] text-text-tertiary transition-colors hover:text-text-primary"
        >
          All topics <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {isLoading && topics.length === 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg border border-border-subtle bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {topics.map((topic) => (
            <ChapterCard key={topic.chapter.id} topic={topic} categories={categories} />
          ))}
        </div>
      )}

      {/* Growth proof: plausible future chapters */}
      <div className="space-y-2 pt-1">
        <div className="border-t border-dashed border-border-subtle pt-2 text-[10px] uppercase tracking-[0.14em] text-text-tertiary">
          Scaled preview · plausible
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {PREVIEW_CHAPTERS.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.id}
                className="flex h-full flex-col rounded-lg border border-border-subtle/60 bg-surface p-3.5 opacity-70"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-surface-2 text-brand">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="mono text-[10px] uppercase tracking-[0.1em] text-text-tertiary">
                    Chapter {String(c.id).padStart(2, "0")}
                  </span>
                </div>
                <div className="text-[13px] font-medium text-text-primary">{c.title}</div>
                <div className="mt-0.5 text-[11.5px] leading-snug text-text-tertiary">{c.tagline}</div>
                <div className="mono mt-auto pt-2.5 text-[10.5px] text-text-tertiary">preview</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
