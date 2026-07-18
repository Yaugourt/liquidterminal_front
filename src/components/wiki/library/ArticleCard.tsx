"use client";

import { ExternalLink, Flag, MessageSquare, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProtectedAction } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { useReadLists } from "@/store/use-readlists";
import { readListMessages, handleReadListApiError } from "@/lib/toast-messages";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import { safeHref } from "@/lib/safeUrl";
import type { EducationalResource } from "@/services/wiki/types";
import { ReportResourceModal } from "../ReportResourceModal";
import { AddToReadListModal } from "../AddToReadListModal";

interface ArticleCardProps {
  resource: EducationalResource;
  onDelete?: (resourceId: number) => void;
  isDeleting?: boolean;
  /**
   * "grid": vertical card with a 16/9 hero (read list pages).
   * "compact": horizontal row with a 64px thumb (library Cards view).
   * "tweet": X/Twitter posts rendered author-avatar + text (no hero image).
   */
  variant?: "grid" | "compact" | "tweet";
}

/** Readable hostname for fallbacks: strips protocol and www. */
function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * The @handle of an X/Twitter *post* URL, for tweet-style cards. Returns null
 * for /i/spaces/… (recorded Spaces are episodes, not tweets) and for any URL
 * with no author segment, which is also how callers decide the card variant.
 */
export function xHandleOf(url: string): string | null {
  try {
    const { hostname, pathname } = new URL(url);
    if (!/(^|\.)(x|twitter|nitter)\.(com|net)$/.test(hostname)) return null;
    const seg = pathname.split("/").filter(Boolean)[0];
    if (!seg || ["i", "intent", "home", "search", "hashtag", "explore"].includes(seg.toLowerCase())) {
      return null;
    }
    return seg;
  } catch {
    return null;
  }
}

/**
 * Library card of the wiki hub. Renders entirely from the inlined
 * linkPreview: real title, description, image, site. Falls back to a
 * favicon / domain-initial tile when the preview has no image.
 */
export const ArticleCard = memo(function ArticleCard({
  resource,
  onDelete,
  isDeleting = false,
  variant = "grid",
}: ArticleCardProps) {
  const [imageError, setImageError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [showReadLists, setShowReadLists] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [addingToListId, setAddingToListId] = useState<number | null>(null);

  const { readLists, addItemToReadList } = useReadLists();
  const { user, authenticated } = useAuthContext();

  const preview = resource.linkPreview;
  const hostname = hostnameOf(resource.url);
  const title = preview?.title || hostname;
  const showHeroImage = !!preview?.image && !imageError;
  const primaryCategory = resource.categories[0]?.category.name;

  // Tweet-style card: X/Twitter posts show the author avatar + text (no hero).
  const xHandle = xHandleOf(resource.url);
  const avatarSrc = xHandle ? `https://unavatar.io/twitter/${xHandle}` : null;
  // X link previews store "Author: tweet text" in the title and "@handle" in
  // the description — so the tweet body comes from the title, not the
  // description (which would render as a bare "@handle").
  const colonAt = preview?.title ? preview.title.indexOf(": ") : -1;
  const authorName =
    colonAt > 0 ? preview!.title!.slice(0, colonAt).slice(0, 48) : xHandle ? `@${xHandle}` : title;
  const tweetText = colonAt > 0 ? preview!.title!.slice(colonAt + 2) : preview?.description || "";

  const handleAddToReadList = useCallback(async (readListId: number) => {
    try {
      setIsAddingToList(true);
      setAddingToListId(readListId);
      const readList = readLists.find(list => list.id === readListId);
      await addItemToReadList(readListId, { resourceId: resource.id });
      setShowReadLists(false);
      setListSearch("");
      readListMessages.success.addedToList(readList?.name || "Read List");
    } catch (error) {
      handleReadListApiError(error);
    } finally {
      setIsAddingToList(false);
      setAddingToListId(null);
    }
  }, [readLists, addItemToReadList, resource.id]);

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const hoverActions = (
    <>
      {authenticated && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => { stop(e); setListSearch(""); setShowReadLists(true); }}
          className="h-auto rounded-lg border border-border-default bg-base/80 p-1.5 text-brand backdrop-blur-sm hover:bg-brand/15"
          title="Add to read list"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      )}
      {authenticated && (
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => { stop(e); setShowReportModal(true); }}
          className="h-auto rounded-lg border border-border-default bg-base/80 p-1.5 text-text-tertiary backdrop-blur-sm hover:bg-danger/15 hover:text-danger"
          title="Report this resource"
        >
          <Flag className="h-3.5 w-3.5" />
        </Button>
      )}
      <ProtectedAction requiredRole="ADMIN" user={user}>
        <Button
          size="sm"
          variant="ghost"
          disabled={isDeleting}
          onClick={(e) => { stop(e); onDelete?.(resource.id); }}
          className="h-auto rounded-lg border border-border-default bg-base/80 p-1.5 text-danger backdrop-blur-sm hover:bg-danger/15"
          title="Delete resource"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </ProtectedAction>
    </>
  );

  const modals = (
    <>
      <AddToReadListModal
        open={showReadLists && authenticated}
        onOpenChange={(open) => { if (!open) { setShowReadLists(false); setListSearch(""); } }}
        resourceLabel={title}
        readLists={readLists}
        search={listSearch}
        onSearchChange={setListSearch}
        onAddToList={handleAddToReadList}
        isAdding={isAddingToList}
        addingToListId={addingToListId}
        onCancel={() => { setShowReadLists(false); setListSearch(""); }}
      />

      <ReportResourceModal
        resourceId={resource.id}
        resourceTitle={title}
        open={showReportModal}
        onOpenChange={setShowReportModal}
      />
    </>
  );

  if (variant === "tweet") {
    return (
      <Card interactive className="group relative flex h-full flex-col p-3.5">
        <a
          href={safeHref(resource.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-full flex-col gap-2.5"
        >
          <div className="flex items-center gap-2">
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border-subtle bg-surface-2">
              {avatarSrc && !avatarError ? (
                <Image
                  src={avatarSrc}
                  alt={authorName}
                  fill
                  className="object-cover"
                  onError={() => setAvatarError(true)}
                  unoptimized
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-sm font-bold uppercase text-brand/40">
                  {hostname.charAt(0)}
                </span>
              )}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-[13px] font-semibold leading-tight text-text-primary transition-colors group-hover:text-brand">
                {authorName}
              </span>
              {xHandle && (
                <span className="truncate text-[11px] leading-tight text-text-tertiary">@{xHandle}</span>
              )}
            </div>
          </div>

          {tweetText && (
            <p className="line-clamp-5 whitespace-pre-line text-[13px] leading-relaxed text-text-secondary">
              {tweetText}
            </p>
          )}

          <div className="mt-auto flex items-center gap-1.5 border-t border-border-subtle pt-2.5 text-[11px] text-text-tertiary">
            <MessageSquare className="h-3 w-3 text-brand" />
            <span>X post</span>
            {resource.createdAt && (
              <>
                <span>·</span>
                <span className="mono">{timeAgo(resource.createdAt)}</span>
              </>
            )}
          </div>
        </a>

        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {hoverActions}
        </div>

        {modals}
      </Card>
    );
  }

  if (variant === "compact") {
    return (
      <div className="group relative flex gap-3 bg-surface p-3.5 transition-colors hover:bg-surface-2/60">
        <a
          href={safeHref(resource.url)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-w-0 flex-1 gap-3"
        >
          {/* Thumb: preview image, or favicon / domain-initial tile */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-border-subtle bg-gradient-to-br from-surface-2 to-base">
            {showHeroImage ? (
              <Image
                src={preview!.image!}
                alt={title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                {preview?.favicon && !faviconError ? (
                  <Image
                    src={preview.favicon}
                    alt={hostname}
                    width={24}
                    height={24}
                    className="rounded opacity-80"
                    onError={() => setFaviconError(true)}
                    unoptimized
                  />
                ) : (
                  <span className="select-none text-xl font-bold uppercase text-brand/30">
                    {hostname.charAt(0)}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-1">
            {primaryCategory && (
              <span className="self-start rounded border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-text-secondary">
                {primaryCategory}
              </span>
            )}
            <h3 className="truncate text-[13px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand">
              {title}
            </h3>
            <div className="mt-auto flex items-center gap-1.5 text-[11px] text-text-tertiary">
              <span className="truncate">{preview?.siteName || hostname}</span>
              {resource.createdAt && (
                <>
                  <span>·</span>
                  <span className="mono shrink-0">{timeAgo(resource.createdAt)}</span>
                </>
              )}
              {typeof resource.savesCount === "number" && resource.savesCount > 0 && (
                <>
                  <span>·</span>
                  <span className="mono shrink-0">{resource.savesCount} saved</span>
                </>
              )}
            </div>
          </div>
        </a>

        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {hoverActions}
        </div>

        {modals}
      </div>
    );
  }

  return (
    <Card interactive className="group relative flex h-full flex-col overflow-hidden">
      <a
        href={safeHref(resource.url)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full flex-col"
      >
        {/* Hero only when a real preview image exists. An empty 16/9 tile with a
            tiny favicon in the middle reads as a broken card, so image-less
            resources go text-forward instead of showing a void. */}
        {showHeroImage && (
          <div
            className="relative w-full shrink-0 overflow-hidden border-b border-border-subtle bg-gradient-to-br from-surface-2 to-base"
            style={{ aspectRatio: "16/9" }}
          >
            <Image
              src={preview!.image!}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              onError={() => setImageError(true)}
              unoptimized
            />
          </div>
        )}

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          {!showHeroImage && (
            <div className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
              {preview?.favicon && !faviconError ? (
                <Image
                  src={preview.favicon}
                  alt={hostname}
                  width={14}
                  height={14}
                  className="rounded-sm opacity-80"
                  onError={() => setFaviconError(true)}
                  unoptimized
                />
              ) : (
                <span className="select-none text-[11px] font-bold uppercase text-brand/50">
                  {hostname.charAt(0)}
                </span>
              )}
              <span className="truncate">{preview?.siteName || hostname}</span>
            </div>
          )}

          <h3
            className={`text-[15px] font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand ${
              showHeroImage ? "line-clamp-2" : "line-clamp-3"
            }`}
          >
            {title}
          </h3>

          {preview?.description && (
            <p
              className={`text-[13px] leading-relaxed text-text-secondary ${
                showHeroImage ? "line-clamp-2" : "line-clamp-4"
              }`}
            >
              {preview.description}
            </p>
          )}

          {/* Category chips */}
          {resource.categories.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {resource.categories.slice(0, 2).map((cat) => (
                <span
                  key={cat.id}
                  className="rounded-md border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-[11px] text-text-tertiary"
                >
                  {cat.category.name}
                </span>
              ))}
              {resource.categories.length > 2 && (
                <span className="text-[11px] text-text-tertiary">
                  +{resource.categories.length - 2}
                </span>
              )}
            </div>
          )}

          {/* Meta footer */}
          <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-2.5 text-xs text-text-tertiary">
            <span className="truncate font-medium text-text-secondary">
              {preview?.siteName || hostname}
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              {resource.createdAt && <span>{timeAgo(resource.createdAt)}</span>}
              <ExternalLink className="h-3 w-3 text-brand" />
            </span>
          </div>
        </div>
      </a>

      {/* Hover actions sit on the card, not the hero: image-less cards have no
          hero to anchor them to. */}
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {hoverActions}
      </div>

      {modals}
    </Card>
  );
});
