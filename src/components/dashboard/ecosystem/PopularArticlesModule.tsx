"use client";

import { memo } from "react";
import { OverviewModule, ModuleRow, Skeleton } from "@/components/common";
import { safeHref } from "@/lib/safeUrl";
import { usePopularWikiResources } from "@/services/wiki";
import type { EducationalResource } from "@/services/wiki/types";
import { FaviconTile } from "@/components/wiki/library/FaviconTile";

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

/**
 * PopularArticlesModule — the wiki's "most saved" leaderboard, sized to sit in
 * any dashboard slot. Shared by the Overview (Learn signal) and the Ecosystem
 * scope, so both rank the same way.
 */
export const PopularArticlesModule = memo(function PopularArticlesModule({
  limit = 5,
  className,
}: {
  limit?: number;
  className?: string;
}) {
  const { resources, isLoading } = usePopularWikiResources(limit);

  return (
    <OverviewModule
      title="Most saved"
      tag="read-list saves"
      tagVariant="plain"
      viewAllLabel="Open wiki"
      href="/wiki"
      className={className}
    >
      {isLoading && resources.length === 0 ? (
        <div className="space-y-2 p-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-md" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <p className="px-3.5 py-4 text-[11.5px] text-text-tertiary">
          No saved resource yet.
        </p>
      ) : (
        resources.map((resource, index) => (
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
              stats={[
                {
                  value: `★ ${resource.savesCount ?? 0}`,
                  valueClassName: "text-gold",
                  width: 40,
                },
              ]}
            />
          </a>
        ))
      )}
    </OverviewModule>
  );
});
