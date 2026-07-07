"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Breadcrumb, RailSearch } from "../primitives";
import { chapterHref, categoryHref } from "../hub/topics";
import { useWikiTopics } from "./useWikiTopics";

/**
 * Canonical topic index (/wiki/topics): every Learn chapter and every
 * community category in one searchable directory. This is the tail-serving
 * page the rails link to instead of a "Show N more" toggle.
 */
export function TopicsIndex() {
  const { chapterTopics, communityCategories, isLoading } = useWikiTopics();
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();
  const chapters = useMemo(
    () => (query ? chapterTopics.filter((t) => t.chapter.title.toLowerCase().includes(query)) : chapterTopics),
    [chapterTopics, query]
  );
  const communities = useMemo(
    () => (query ? communityCategories.filter((c) => c.name.toLowerCase().includes(query)) : communityCategories),
    [communityCategories, query]
  );

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Wiki", href: "/wiki" }, { label: "Topics" }]} />

      <div className="space-y-1">
        <h1 className="font-inter text-2xl font-semibold tracking-tight text-text-primary">Topics</h1>
        <p className="text-sm text-text-secondary">
          Every Learn chapter and community category in one place.
        </p>
      </div>

      <RailSearch
        value={q}
        onChange={setQ}
        placeholder="Filter chapters and categories"
        size="lg"
        className="max-w-md"
      />

      {isLoading ? (
        <div className="h-96 animate-pulse rounded-lg border border-border-subtle bg-surface" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Fundamentals */}
          <section className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
            <div className="flex items-baseline justify-between border-b border-border-subtle px-4 py-3">
              <h2 className="text-[13px] font-semibold text-text-primary">Fundamentals</h2>
              <span className="mono text-[11px] text-text-tertiary">{chapters.length}</span>
            </div>
            {chapters.length === 0 ? (
              <p className="px-4 py-6 text-[12px] text-text-tertiary">No chapter matches.</p>
            ) : (
              chapters.map((t) => {
                const Icon = t.icon;
                return (
                  <Link
                    key={t.chapter.id}
                    href={chapterHref(t.chapter.title)}
                    className="flex items-center gap-3 border-b border-border-subtle px-4 py-2.5 transition-colors last:border-b-0 hover:bg-surface-2/60"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-2 text-brand">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-medium text-text-primary">{t.chapter.title}</div>
                      <div className="truncate text-[11px] text-text-tertiary">{t.meta.tagline}</div>
                    </div>
                    <span className="mono shrink-0 text-[11.5px] text-text-secondary">{t.articleCount}</span>
                  </Link>
                );
              })
            )}
          </section>

          {/* Community categories */}
          <section className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
            <div className="flex items-baseline justify-between border-b border-border-subtle px-4 py-3">
              <h2 className="text-[13px] font-semibold text-text-primary">Community categories</h2>
              <span className="mono text-[11px] text-text-tertiary">{communities.length}</span>
            </div>
            <div className="max-h-[560px] overflow-y-auto">
              {communities.length === 0 ? (
                <p className="px-4 py-6 text-[12px] text-text-tertiary">No category matches.</p>
              ) : (
                communities.map((c) => (
                  <Link
                    key={c.id}
                    href={categoryHref(c.name)}
                    className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-2.5 transition-colors last:border-b-0 hover:bg-surface-2/60"
                  >
                    <span className="truncate text-[13px] text-text-secondary">{c.name}</span>
                    <span className="mono shrink-0 text-[11.5px] text-text-tertiary">{c.resourcesCount ?? 0}</span>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
