"use client";

import { Star } from "lucide-react";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { safeHref } from "@/lib/safeUrl";
import type { EducationalResource } from "@/services/wiki/types";
import { FaviconTile } from "../library/FaviconTile";

interface ArticleRowProps {
  resource: EducationalResource;
  /** Larger paddings for the reader-style contexts. */
  className?: string;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Dense one-line article row of the hub bands: favicon, title, domain,
 * then age or a gold saves badge. Opens the source in a new tab.
 */
export function ArticleRow({ resource, className }: ArticleRowProps) {
  const preview = resource.linkPreview;
  const hostname = hostnameOf(resource.url);
  const saves = resource.savesCount ?? 0;

  return (
    <a
      href={safeHref(resource.url)}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex cursor-pointer items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-surface-2/60 ${className ?? ""}`}
    >
      <FaviconTile favicon={preview?.favicon} hostname={hostname} size={24} />
      <span className="truncate text-[12.5px] font-medium text-text-primary">
        {preview?.title || hostname}
      </span>
      <span className="hidden shrink-0 truncate text-[11px] text-text-tertiary sm:inline">
        {preview?.siteName || hostname}
      </span>
      {saves > 0 ? (
        <span className="mono ml-auto flex shrink-0 items-center gap-1 text-[10.5px] text-gold">
          <Star className="h-2.5 w-2.5 fill-gold" />
          {saves}
        </span>
      ) : (
        <span className="mono ml-auto shrink-0 text-[10.5px] text-text-tertiary">
          {timeAgo(resource.createdAt)}
        </span>
      )}
    </a>
  );
}
