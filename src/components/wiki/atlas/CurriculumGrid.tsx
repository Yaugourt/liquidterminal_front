"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ChapterTopic } from "../hub/topics";
import type { EducationalCategory } from "@/services/wiki/types";
import { ChapterCard } from "./ChapterCard";

interface CurriculumGridProps {
  topics: ChapterTopic[];
  categories: EducationalCategory[];
  isLoading?: boolean;
}

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
    </section>
  );
}
