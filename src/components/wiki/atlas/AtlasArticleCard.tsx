"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { safeHref } from "@/lib/safeUrl";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import type { EducationalResource } from "@/services/wiki/types";
import { trackResourceOpened } from "@/lib/analytics";
import { TypeBadge, SaveToListButton, detectContentType } from "../primitives";

interface AtlasArticleCardProps {
  resource: EducationalResource;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Atlas article card: TypeBadge (no monogram tile), title, one-line
 * description, "domain · age" meta, and a persistent SaveToListButton with
 * the gold saves count. Used in every card feed.
 */
export const AtlasArticleCard = memo(function AtlasArticleCard({ resource }: AtlasArticleCardProps) {
  const preview = resource.linkPreview;
  const hostname = hostnameOf(resource.url);
  const title = preview?.title || hostname;
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="group relative flex flex-col gap-2 bg-surface p-3.5 transition-colors hover:bg-surface-2/60">
      <div className="flex items-center justify-between gap-2">
        <TypeBadge url={resource.url} />
        <SaveToListButton
          resourceId={resource.id}
          resourceTitle={title}
          savesCount={resource.savesCount}
          variant="chip"
        />
      </div>
      <a
        href={safeHref(resource.url)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackResourceOpened(detectContentType(resource.url))}
        className="flex min-w-0 flex-col gap-1.5"
      >
        {preview?.image && imgOk && (
          <span className="relative mb-0.5 block aspect-[16/9] w-full overflow-hidden rounded-md border border-border-subtle bg-surface-2">
            <Image
              src={preview.image}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 320px"
              className="object-cover"
              onError={() => setImgOk(false)}
              unoptimized
            />
          </span>
        )}
        <h3 className="text-[13px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand">
          {title}
        </h3>
        {preview?.description && (
          <p className="truncate text-[11.5px] leading-relaxed text-text-secondary">
            {preview.description}
          </p>
        )}
        <div className="mt-auto flex items-center gap-1.5 pt-1 text-[11px] text-text-tertiary">
          <span className="truncate">{preview?.siteName || hostname}</span>
          {resource.createdAt && (
            <>
              <span>·</span>
              <span className="mono shrink-0">{timeAgo(resource.createdAt)}</span>
            </>
          )}
        </div>
      </a>
    </div>
  );
});
