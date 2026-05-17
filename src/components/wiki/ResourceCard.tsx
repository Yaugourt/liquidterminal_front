"use client";

import { ExternalLink, Plus, Trash2, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, memo, useCallback } from "react";
import Image from "next/image";
import { useReadLists } from "@/store/use-readlists";
import { useLinkPreview } from "@/services/wiki/linkPreview/hooks/hooks";
import { ProtectedAction } from "@/components/common";
import { useAuthContext } from "@/contexts/auth.context";
import { readListMessages, handleReadListApiError } from "@/lib/toast-messages";
import { ReportResourceModal } from "./ReportResourceModal";
import { AddToReadListModal } from "./AddToReadListModal";
import { resourceStatusConfig } from "./resource-status-config";
import { ResourceStatus } from "@/services/wiki/types";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
  status?: ResourceStatus;
  reviewNotes?: string;
}

interface ResourceCardProps {
  resource: Resource;
  categoryColor: string;
  onDelete?: (resourceId: number) => void;
  isDeleting?: boolean;
  showStatus?: boolean;
}

export const ResourceCard = memo(function ResourceCard({ resource, onDelete, isDeleting = false, showStatus = false }: ResourceCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [addingToListId, setAddingToListId] = useState<number | null>(null);
  const [showReadLists, setShowReadLists] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [listSearch, setListSearch] = useState("");
  const { readLists, addItemToReadList } = useReadLists();
  const { user, authenticated } = useAuthContext();

  const { data: preview, isLoading: previewLoading } = useLinkPreview(
    resource.url && resource.url.startsWith('http') ? resource.url : ''
  );

  const handleAddToReadList = useCallback(async (readListId: number) => {
    try {
      setIsAddingToList(true);
      setAddingToListId(readListId);
      const readList = readLists.find(list => list.id === readListId);
      await addItemToReadList(readListId, {
        resourceId: parseInt(resource.id),
        notes: `Added from ${resource.title}`
      });
      setShowReadLists(false);
      setListSearch("");
      readListMessages.success.addedToList(readList?.name || 'Read List');
    } catch (error) {
      handleReadListApiError(error);
    } finally {
      setIsAddingToList(false);
      setAddingToListId(null);
    }
  }, [readLists, addItemToReadList, resource.id, resource.title]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(parseInt(resource.id));
    }
  }, [onDelete, resource.id]);

  const handleOpenModal = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (authenticated) {
      setListSearch("");
      setShowReadLists(true);
    }
  }, [authenticated]);

  const handleCloseModal = useCallback(() => {
    setShowReadLists(false);
    setListSearch("");
  }, []);

  const status = resource.status || 'APPROVED';
  const StatusIcon = resourceStatusConfig[status].icon;

  return (
    <Card className="hover:border-border-hover group overflow-hidden relative">
      {showStatus && status !== 'APPROVED' && (
        <div className={`absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${resourceStatusConfig[status].color}`}>
          <StatusIcon className="w-3 h-3" />
          <span>{resourceStatusConfig[status].label}</span>
        </div>
      )}

      <ProtectedAction requiredRole="ADMIN" user={user}>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            onClick={handleDelete}
            size="sm"
            variant="ghost"
            disabled={isDeleting}
            className="p-1 h-auto text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-lg"
            title="Delete resource"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </ProtectedAction>

      <div className="p-0">
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div className="relative w-full overflow-hidden bg-gradient-to-br from-brand-dark to-brand-secondary" style={{ aspectRatio: '16/9' }}>
            {resource.url && resource.url.startsWith('http') && preview?.image ? (
              <Image
                src={preview.image}
                alt={preview.title || resource.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : !imageError && resource.image ? (
              <Image
                src={resource.image}
                alt={resource.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-brand-accent opacity-20">
                  <ExternalLink size={48} />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-text-primary line-clamp-2 group-hover:text-brand-accent transition-colors">
                {preview?.title || resource.title}
              </h3>
              <ExternalLink size={14} className="text-brand-accent mt-0.5 flex-shrink-0" />
            </div>

            <p className="text-xs text-text-secondary line-clamp-2">
              {preview?.description || resource.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <Badge
                variant="secondary"
                className="bg-brand-dark text-text-secondary border border-border-subtle text-xs rounded-md"
              >
                {preview?.siteName || 'Article'}
              </Badge>
              <div className="flex items-center gap-1">
                {previewLoading && (
                  <span className="text-xs text-text-muted">Loading...</span>
                )}

                {authenticated && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowReportModal(true);
                    }}
                    className="p-1.5 h-auto rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-400/10"
                    title="Report this resource"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!authenticated}
                  onClick={handleOpenModal}
                  className={`p-1.5 h-auto rounded-lg transition-all ${authenticated
                    ? "text-brand-accent hover:bg-brand-accent/10 hover:scale-110"
                    : "text-text-muted cursor-not-allowed"
                    }`}
                  title={authenticated ? "Add to read list" : "Login required"}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </a>

        <AddToReadListModal
          open={showReadLists && authenticated}
          onOpenChange={(open) => !open && handleCloseModal()}
          resourceLabel={preview?.title || resource.title}
          readLists={readLists}
          search={listSearch}
          onSearchChange={setListSearch}
          onAddToList={handleAddToReadList}
          isAdding={isAddingToList}
          addingToListId={addingToListId}
          onCancel={handleCloseModal}
        />

        <ReportResourceModal
          resourceId={parseInt(resource.id)}
          resourceTitle={preview?.title || resource.title}
          open={showReportModal}
          onOpenChange={setShowReportModal}
        />
      </div>
    </Card>
  );
});

ResourceCard.displayName = 'ResourceCard';
