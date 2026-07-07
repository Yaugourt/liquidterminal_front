"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { Breadcrumb } from "../primitives";
import { PrimerBand } from "../hub/PrimerBand";
import { chapterHref, slugify, subChapterCategoryIds, type ChapterTopic } from "../hub/topics";
import { useWikiTopics } from "./useWikiTopics";
import { WikiRail } from "./WikiRail";
import { ArticleFeed } from "./ArticleFeed";

interface ChapterViewProps {
  chapterSlug: string;
  /** Optional sub-chapter id (e.g. "hip-3"). */
  subId?: string;
}

/**
 * Routed chapter topic view (/wiki/learn/[chapter]/[sub]): breadcrumb, shared
 * rail, Learn primer with URL-driven sub-tabs, and the community articles of
 * the chapter (or the active sub) filtered by category.
 */
export function ChapterView({ chapterSlug, subId }: ChapterViewProps) {
  const router = useRouter();
  const { chapterTopics, communityCategories, categories, isLoading } = useWikiTopics();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 w-64 animate-pulse rounded bg-surface-2" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <div className="h-96 animate-pulse rounded-lg bg-surface" />
          <div className="h-96 animate-pulse rounded-lg bg-surface" />
        </div>
      </div>
    );
  }

  const topic: ChapterTopic | undefined = chapterTopics.find(
    (t) => slugify(t.chapter.title) === chapterSlug
  );
  if (!topic) return notFound();

  const activeSub = subId && (topic.chapter.subChapters ?? []).some((s) => s.id === subId) ? subId : null;
  const categoryIds = subChapterCategoryIds(topic, activeSub, categories);

  const crumbs = [
    { label: "Wiki", href: "/wiki" },
    { label: "Learn", href: "/wiki/topics" },
    { label: topic.chapter.title, href: activeSub ? chapterHref(topic.chapter.title) : undefined },
    ...(activeSub
      ? [{ label: (topic.chapter.subChapters ?? []).find((s) => s.id === activeSub)?.title ?? activeSub }]
      : []),
  ];

  const keepLearning = chapterTopics.filter((t) => t.chapter.id !== topic.chapter.id).slice(0, 3);

  return (
    <div className="space-y-4">
      <Breadcrumb items={crumbs} />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <WikiRail
          chapterTopics={chapterTopics}
          communityCategories={communityCategories}
          categories={categories}
          active={{ kind: "chapter", chapterId: topic.chapter.id, subId: activeSub ?? undefined }}
          className="min-w-0 lg:sticky lg:top-4 lg:self-start"
        />

        <div className="min-w-0 space-y-4">
          <PrimerBand
            topic={topic}
            activeSubId={activeSub}
            onSubChange={(id) =>
              router.push(id ? chapterHref(topic.chapter.title, id) : chapterHref(topic.chapter.title))
            }
          />

          <ArticleFeed
            key={`${topic.chapter.id}-${activeSub ?? "all"}`}
            categoryIds={categoryIds.length > 0 ? categoryIds : undefined}
            title="Community articles"
            defaultView="cards"
            showCategory
            searchPlaceholder={`Search in ${activeSub ? activeSub.toUpperCase() : topic.chapter.title}`}
          />

          {keepLearning.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-1 text-[11.5px]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
                Keep learning
              </span>
              {keepLearning.map((t) => (
                <Link
                  key={t.chapter.id}
                  href={chapterHref(t.chapter.title)}
                  className="flex items-center gap-1 rounded-md border border-border-subtle bg-surface px-2.5 py-1 text-text-secondary transition-colors hover:text-text-primary"
                >
                  {t.chapter.title} <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
