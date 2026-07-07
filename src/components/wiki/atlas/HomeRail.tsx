"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OverviewModule, ModuleRow, Skeleton } from "@/components/common";
import { safeHref } from "@/lib/safeUrl";
import { usePopularWikiResources } from "@/services/wiki";
import type { EducationalResource } from "@/services/wiki/types";
import type { PublicReadList } from "@/services/wiki/readList/types";
import { slugify } from "../hub/topics";
import { FaviconTile } from "../library/FaviconTile";

interface HomeRailProps {
  readLists: PublicReadList[];
  readListsLoading: boolean;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function titleOf(r: EducationalResource): string {
  return r.linkPreview?.title || hostnameOf(r.url);
}

/**
 * Atlas home right rail: the "Read lists" module (real lists + start-a-path
 * CTA) and the "Most saved" module (the real gold-star articles).
 */
export function HomeRail({ readLists, readListsLoading }: HomeRailProps) {
  const popular = usePopularWikiResources(5);

  return (
    <aside className="min-w-0 space-y-4 xl:sticky xl:top-6">
      <OverviewModule title="Read lists" href="/wiki/readlists" viewAllLabel="All">
        {readListsLoading && readLists.length === 0 ? (
          <div className="space-y-2 p-3.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : readLists.length === 0 ? (
          <p className="px-3.5 py-4 text-[11.5px] text-text-tertiary">No public list yet.</p>
        ) : (
          readLists.slice(0, 3).map((list) => (
            <Link key={list.id} href={`/wiki/readlists/${slugify(list.name)}-${list.id}`} className="block">
              <ModuleRow
                rank={1}
                logo={
                  <span className="grid h-full w-full place-items-center text-[9px] font-semibold uppercase">
                    {list.name.slice(0, 2)}
                  </span>
                }
                name={list.name}
                sub={`by ${list.creator.name}`}
                stats={[{ value: `${list.itemsCount} items`, width: 64 }]}
              />
            </Link>
          ))
        )}
        <Link
          href="/wiki/readlists"
          className="flex items-center gap-1 border-t border-border-subtle px-3.5 py-2.5 text-[11.5px] font-medium text-brand transition-colors hover:text-brand-hover"
        >
          Start a reading path <ArrowRight className="h-3 w-3" />
        </Link>
      </OverviewModule>

      <OverviewModule title="Most saved" tag="read-list saves" tagVariant="plain">
        {popular.isLoading && popular.resources.length === 0 ? (
          <div className="space-y-2 p-3.5">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
        ) : popular.resources.length === 0 ? (
          <p className="px-3.5 py-4 text-[11.5px] text-text-tertiary">No saved resource yet.</p>
        ) : (
          popular.resources.map((r, i) => (
            <a key={r.id} href={safeHref(r.url)} target="_blank" rel="noopener noreferrer" className="block">
              <ModuleRow
                rank={i + 1}
                logo={
                  <FaviconTile favicon={r.linkPreview?.favicon} hostname={hostnameOf(r.url)} size={28} />
                }
                name={titleOf(r)}
                sub={hostnameOf(r.url)}
                stats={[{ value: `★ ${r.savesCount ?? 0}`, valueClassName: "text-gold", width: 40 }]}
              />
            </a>
          ))
        )}
      </OverviewModule>
    </aside>
  );
}
