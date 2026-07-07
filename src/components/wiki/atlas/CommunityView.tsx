"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumb } from "../primitives";
import { categoryHref, slugify } from "../hub/topics";
import { useWikiTopics } from "./useWikiTopics";
import { WikiRail } from "./WikiRail";
import { ArticleFeed } from "./ArticleFeed";

interface CommunityViewProps {
  categorySlug: string;
}

/**
 * Routed community category view (/wiki/c/[slug]): breadcrumb, shared rail,
 * a compact CategoryHeader (name, count, related chips, and the dashed
 * "suggest the canonical doc" funnel since no Learn primer exists), then the
 * category's articles as a table (density on the tail).
 */
export function CommunityView({ categorySlug }: CommunityViewProps) {
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

  const category = categories.find((c) => slugify(c.name) === categorySlug);
  if (!category) return notFound();

  const related = communityCategories.filter((c) => c.id !== category.id).slice(0, 3);

  return (
    <div className="space-y-4">
      <Breadcrumb
        items={[
          { label: "Wiki", href: "/wiki" },
          { label: "Community", href: "/wiki/topics" },
          { label: category.name },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <WikiRail
          chapterTopics={chapterTopics}
          communityCategories={communityCategories}
          categories={categories}
          active={{ kind: "category", categoryId: category.id }}
          className="min-w-0 lg:sticky lg:top-4 lg:self-start"
        />

        <div className="min-w-0 space-y-4">
          {/* Category header */}
          <div className="space-y-3 rounded-lg border border-border-subtle bg-surface p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
              <h1 className="min-w-0 truncate text-[20px] font-semibold text-text-primary">{category.name}</h1>
              <span className="shrink-0 text-[11px] uppercase tracking-wide text-text-tertiary">
                Community category · no Learn primer
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-[12.5px] text-text-secondary">
                Community writing tagged {category.name}.
              </p>
              <span className="mono text-[11px] text-text-tertiary">
                {category.resourcesCount ?? 0} resources
              </span>
            </div>
            {related.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {related.map((c) => (
                  <Link
                    key={c.id}
                    href={categoryHref(c.name)}
                    className="rounded-md border border-border-subtle bg-surface px-2.5 py-1 text-[11.5px] text-text-secondary transition-colors hover:text-text-primary"
                  >
                    {c.name} <span className="mono text-text-tertiary">{c.resourcesCount ?? 0}</span>
                  </Link>
                ))}
              </div>
            )}
            <Link
              href={`/wiki/contributions?category=${category.id}`}
              className="flex items-center gap-1.5 rounded-md border border-dashed border-border-default px-3 py-2 text-[12px] text-text-secondary transition-colors hover:text-text-primary"
            >
              No Learn primer exists for this category yet. Know the canonical doc? Suggest it
              <ArrowRight className="h-3 w-3 text-brand" />
            </Link>
          </div>

          <ArticleFeed
            key={`category-${category.id}`}
            categoryIds={[category.id]}
            title={category.name}
            defaultView="table"
            showCategory={false}
            searchPlaceholder={`Search in ${category.name}`}
          />

          {related.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-1 text-[11.5px]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-tertiary">
                Keep exploring
              </span>
              {related.map((c) => (
                <Link
                  key={c.id}
                  href={categoryHref(c.name)}
                  className="flex items-center gap-1 rounded-md border border-border-subtle bg-surface px-2.5 py-1 text-text-secondary transition-colors hover:text-text-primary"
                >
                  {c.name} <ArrowRight className="h-3 w-3" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
