"use client";

import { ExternalLink, Flag, Plus, Trash2 } from "lucide-react";
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
 * Library card of the wiki hub. Renders entirely from the inlined
 * linkPreview: real title, description, image, site. Falls back to a
 * favicon / domain-initial tile when the preview has no image.
 */
export const ArticleCard = memo(function ArticleCard({ resource, onDelete, isDeleting = false }: ArticleCardProps) {
  const [imageError, setImageError] = useState(false);
  const [faviconError, setFaviconError] = useState(false);
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

  return (
    <Card interactive className="group relative flex h-full flex-col overflow-hidden">
      <a
        href={safeHref(resource.url)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full flex-col"
      >
        {/* Hero: preview image, or favicon / domain-initial fallback */}
        <div className="relative w-full shrink-0 overflow-hidden border-b border-border-subtle bg-gradient-to-br from-surface-2 to-base" style={{ aspectRatio: "16/9" }}>
          {showHeroImage ? (
            <Image
              src={preview!.image!}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              {preview?.favicon && !faviconError ? (
                <Image
                  src={preview.favicon}
                  alt={hostname}
                  width={40}
                  height={40}
                  className="rounded-md opacity-80"
                  onError={() => setFaviconError(true)}
                  unoptimized
                />
              ) : (
                <span className="select-none text-4xl font-bold uppercase text-brand/25">
                  {hostname.charAt(0)}
                </span>
              )}
            </div>
          )}

          {/* Hover actions */}
          <div className="absolute right-2 top-2 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
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
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="text-[15px] font-semibold leading-snug text-text-primary line-clamp-2 transition-colors group-hover:text-brand">
            {title}
          </h3>

          {preview?.description && (
            <p className="text-[13px] leading-relaxed text-text-secondary line-clamp-2">
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
    </Card>
  );
});
