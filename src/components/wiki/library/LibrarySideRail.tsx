"use client";

import Link from "next/link";
import { ArrowRight, BookMarked } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OverviewModule, ModuleRow, Skeleton } from "@/components/common";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { safeHref } from "@/lib/safeUrl";
import { usePopularWikiResources, useWikiLibrary } from "@/services/wiki";
import type { EducationalResource } from "@/services/wiki/types";
import { FaviconTile } from "./FaviconTile";

interface LibrarySideRailProps {
  /** Bump to refresh the "Recently added" module after a submission. */
  refreshToken?: number;
  className?: string;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function titleOf(resource: EducationalResource): string {
  return resource.linkPreview?.title || hostnameOf(resource.url);
}

function ModuleSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-2 p-3.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-full rounded-md" />
      ))}
    </div>
  );
}

/**
 * Right rail of the library command center: "Most saved" leaderboard
 * (read-list saves), "Recently added" and the read lists shortcut.
 */
export function LibrarySideRail({ refreshToken = 0, className }: LibrarySideRailProps) {
  const popular = usePopularWikiResources(5);
  const recent = useWikiLibrary(
    { page: 1, limit: 3, sort: "createdAt", order: "desc" },
    { refreshToken }
  );

  return (
    <aside className={className}>
      <div className="space-y-4">
        {/* Most saved */}
        <OverviewModule title="Most saved" tag="read-list saves" tagVariant="plain">
          {popular.isLoading && popular.resources.length === 0 ? (
            <ModuleSkeleton rows={5} />
          ) : popular.resources.length === 0 ? (
            <p className="px-3.5 py-4 text-[11.5px] text-text-tertiary">
              No resource saved to a read list yet.
            </p>
          ) : (
            popular.resources.map((resource, index) => (
              <a
                key={resource.id}
                href={safeHref(resource.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <ModuleRow
                  rank={index + 1}
                  logo={
                    <FaviconTile
                      favicon={resource.linkPreview?.favicon}
                      hostname={hostnameOf(resource.url)}
                      size={28}
                    />
                  }
                  name={titleOf(resource)}
                  sub={hostnameOf(resource.url)}
                  stats={[{ value: resource.savesCount ?? 0, width: 40 }]}
                />
              </a>
            ))
          )}
        </OverviewModule>

        {/* Recently added */}
        <OverviewModule title="Recently added" tagVariant="plain">
          {recent.isLoading && recent.resources.length === 0 ? (
            <ModuleSkeleton rows={3} />
          ) : (
            recent.resources.map((resource) => (
              <a
                key={resource.id}
                href={safeHref(resource.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border-b border-border-subtle px-3.5 py-2.5 transition-colors last:border-b-0 hover:bg-surface-2"
              >
                <FaviconTile
                  favicon={resource.linkPreview?.favicon}
                  hostname={hostnameOf(resource.url)}
                  size={24}
                />
                <div className="min-w-0">
                  <div className="truncate text-[12.5px] font-medium text-text-primary">
                    {titleOf(resource)}
                  </div>
                  <div className="mono text-[10px] text-text-tertiary">
                    {timeAgo(resource.createdAt)}
                  </div>
                </div>
              </a>
            ))
          )}
        </OverviewModule>

        {/* Read lists shortcut */}
        <Card padding="md" className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-brand/10">
              <BookMarked className="h-3.5 w-3.5 text-brand" />
            </span>
            <h3 className="text-[13px] font-semibold text-text-primary">Read lists</h3>
          </div>
          <p className="text-[11.5px] leading-relaxed text-text-secondary">
            Curated reading paths built by the community.
          </p>
          <Link
            href="/wiki/readlist"
            className="inline-flex items-center gap-1 text-[11.5px] font-medium text-brand transition-colors hover:text-brand-hover"
          >
            Browse read lists
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Card>
      </div>
    </aside>
  );
}
