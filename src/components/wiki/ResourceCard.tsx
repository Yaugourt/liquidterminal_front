"use client";

import { ExternalLink, Plus, BookOpen, Trash2, Flag, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";
import { useReadLists } from "@/store/use-readlists";
import { useLinkPreview } from "@/services/wiki/linkPreview/hooks/hooks";
import { ProtectedAction } from "@/components/common/ProtectedAction";
import { useAuthContext } from "@/contexts/auth.context";
import { readListMessages, handleReadListApiError } from "@/lib/toast-messages";
import { ReportResourceModal } from "./ReportResourceModal";
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

const statusConfig: Record<ResourceStatus, { icon: typeof Clock; label: string; color: string }> = {
  PENDING: { icon: Clock, label: "Pending", color: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  APPROVED: { icon: CheckCircle, label: "Approved", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  REJECTED: { icon: XCircle, label: "Rejected", color: "text-rose-400 bg-rose-400/10 border-rose-400/20" },
};

export function ResourceCard({ resource, onDelete, isDeleting = false, showStatus = false }: ResourceCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [showReadLists, setShowReadLists] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { readLists, addItemToReadList } = useReadLists();
  const { user, authenticated } = useAuthContext();

  // Load link preview
  const { data: preview, isLoading: previewLoading } = useLinkPreview(
    resource.url && resource.url.startsWith('http') ? resource.url : ''
  );

  const handleAddToReadList = async (readListId: number) => {
    try {
      setIsAddingToList(true);
      const readList = readLists.find(list => list.id === readListId);
      await addItemToReadList(readListId, {
        resourceId: parseInt(resource.id),
        notes: `Added from ${resource.title}`
      });
      setShowReadLists(false);
      readListMessages.success.addedToList(readList?.name || 'Read List');
    } catch (error) {
      handleReadListApiError(error);
    } finally {
      setIsAddingToList(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(parseInt(resource.id));
    }
  };

  const status = resource.status || 'APPROVED';
  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 group overflow-hidden relative">
      {/* Status badge (top left) */}
      {showStatus && status !== 'APPROVED' && (
        <div className={`absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${statusConfig[status].color}`}>
          <StatusIcon className="w-3 h-3" />
          <span>{statusConfig[status].label}</span>
        </div>
      )}

      {/* Delete button for admins */}
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
          {/* Image section */}
          <div className="relative w-full overflow-hidden bg-gradient-to-br from-brand-dark to-brand-secondary" style={{ aspectRatio: '16/9' }}>
            {resource.url && resource.url.startsWith('http') && preview?.image ? (
              <Image
                src={preview.image}
                alt={preview.title || resource.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : !imageError && resource.image ? (
              <Image
                src={resource.image}
                alt={resource.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-brand-accent opacity-20">
                  <ExternalLink size={48} />
                </div>
              </div>
            )}
          </div>

          {/* Content section */}
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-brand-accent transition-colors">
                {preview?.title || resource.title}
              </h3>
              <ExternalLink size={14} className="text-brand-accent mt-0.5 flex-shrink-0" />
            </div>

            <p className="text-xs text-zinc-400 line-clamp-2">
              {preview?.description || resource.description}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <Badge
                variant="secondary"
                className="bg-brand-dark text-zinc-400 border border-white/5 text-xs rounded-md"
              >
                {preview?.siteName || 'Article'}
              </Badge>
              <div className="flex items-center gap-1">
                {previewLoading && (
                  <span className="text-xs text-zinc-500">Loading...</span>
                )}

                {/* Report button */}
                {authenticated && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowReportModal(true);
                    }}
                    className="p-1.5 h-auto rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-400/10"
                    title="Report this resource"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </Button>
                )}

                {/* Add to read list button */}
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={!authenticated}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (authenticated) {
                      setShowReadLists(!showReadLists);
                    }
                  }}
                  className={`p-1.5 h-auto rounded-lg ${authenticated
                    ? "text-brand-accent hover:bg-brand-accent/10"
                    : "text-zinc-600 cursor-not-allowed"
                    }`}
                  title={authenticated ? "Add to read list" : "Login required to add to read list"}
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </a>

        {/* Read Lists Modal */}
        <Dialog open={showReadLists && authenticated} onOpenChange={(open) => !open && setShowReadLists(false)}>
          <DialogContent className="max-w-sm bg-brand-secondary border-white/10 p-6 z-[9999]">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-white mb-4">Add to read list:</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {readLists.length === 0 ? (
                <div className="text-sm text-zinc-500 py-4 text-center">
                  No read lists available
                </div>
              ) : (
                <div className="space-y-2">
                  {readLists.map((readList) => (
                    <button
                      key={`readlist-${readList.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToReadList(readList.id);
                      }}
                      disabled={isAddingToList}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white/5 rounded-xl flex items-center gap-3 disabled:opacity-50 transition-colors border border-white/5 hover:border-white/10"
                    >
                      <BookOpen className="w-5 h-5 text-brand-accent flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{readList.name}</div>
                        {readList.description && (
                          <div className="text-xs text-zinc-500 mt-1">{readList.description}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter className="mt-6 pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowReadLists(false);
                }}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Report Modal */}
        <ReportResourceModal
          resourceId={parseInt(resource.id)}
          resourceTitle={preview?.title || resource.title}
          open={showReportModal}
          onOpenChange={setShowReportModal}
        />
      </div>
    </div>
  );
} 