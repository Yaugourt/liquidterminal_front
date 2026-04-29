"use client";

import { ExternalLink, Plus, BookOpen, Trash2, Flag, Clock, CheckCircle, XCircle, Search, ListPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, memo, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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

  const filteredLists = useMemo(() => {
    if (!listSearch.trim()) return readLists;
    return readLists.filter(l => l.name.toLowerCase().includes(listSearch.toLowerCase()));
  }, [readLists, listSearch]);

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
  const StatusIcon = statusConfig[status].icon;

  return (
    <div className="bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 group overflow-hidden relative">
      {showStatus && status !== 'APPROVED' && (
        <div className={`absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-1 rounded-md border text-xs ${statusConfig[status].color}`}>
          <StatusIcon className="w-3 h-3" />
          <span>{statusConfig[status].label}</span>
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
              <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-brand-accent transition-colors">
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

        {/* Add to Read List Modal */}
        <Dialog open={showReadLists && authenticated} onOpenChange={(open) => !open && handleCloseModal()}>
          <DialogContent className="max-w-sm bg-brand-secondary border-border-hover p-0 z-[9999] overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 pt-5 pb-4 border-b border-border-subtle bg-gradient-to-r from-brand-accent/5 to-transparent">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                    <ListPlus className="w-4 h-4 text-brand-accent" />
                  </div>
                  <div className="min-w-0">
                    <DialogTitle className="text-sm font-bold text-white">Add to Read List</DialogTitle>
                    <p className="text-xs text-text-muted mt-0.5 truncate">
                      {preview?.title || resource.title}
                    </p>
                  </div>
                </div>
              </DialogHeader>
            </div>

            {/* Search */}
            {readLists.length > 3 && (
              <div className="px-4 pt-3 pb-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                  <Input
                    value={listSearch}
                    onChange={e => setListSearch(e.target.value)}
                    placeholder="Search lists..."
                    className="pl-9 h-8 text-xs bg-brand-dark border-border-subtle text-white rounded-lg placeholder:text-text-muted focus:border-brand-accent/50"
                  />
                </div>
              </div>
            )}

            {/* List */}
            <div className="px-4 py-3 max-h-[280px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border-subtle">
              <AnimatePresence mode="wait">
                {readLists.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-center py-8"
                  >
                    <div className="w-10 h-10 mx-auto mb-3 bg-brand-accent/10 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-brand-accent" />
                    </div>
                    <p className="text-sm text-text-muted">No read lists yet</p>
                    <p className="text-xs text-text-muted mt-1 opacity-70">Create one on the Read List page</p>
                  </motion.div>
                ) : filteredLists.length === 0 ? (
                  <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-6 text-sm text-text-muted"
                  >
                    No lists match &quot;{listSearch}&quot;
                  </motion.div>
                ) : (
                  <motion.div key="list" className="space-y-1.5">
                    {filteredLists.map((readList, i) => (
                      <motion.button
                        key={`readlist-${readList.id}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToReadList(readList.id);
                        }}
                        disabled={isAddingToList}
                        className="w-full text-left px-3.5 py-2.5 text-sm text-white hover:bg-white/5 rounded-xl flex items-center gap-3 disabled:opacity-50 transition-all border border-border-subtle hover:border-brand-accent/30 group/item"
                      >
                        <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-brand-accent/20 transition-colors">
                          {addingToListId === readList.id ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-brand-accent/30 border-t-brand-accent rounded-full"
                            />
                          ) : (
                            <BookOpen className="w-4 h-4 text-brand-accent" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{readList.name}</div>
                          {readList.description && (
                            <div className="text-xs text-text-muted mt-0.5 truncate">{readList.description}</div>
                          )}
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-1.5">
                          {readList.isPublic && (
                            <span className="text-label bg-brand-accent/10 text-brand-accent px-1.5 py-0.5 rounded">
                              Public
                            </span>
                          )}
                          <span className="text-xs text-text-muted tabular-nums">
                            {readList.itemsCount ?? 0}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 pb-4 pt-2 border-t border-border-subtle flex justify-end">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCloseModal();
                }}
                className="px-4 py-2 text-sm interactive-secondary rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <ReportResourceModal
          resourceId={parseInt(resource.id)}
          resourceTitle={preview?.title || resource.title}
          open={showReportModal}
          onOpenChange={setShowReportModal}
        />
      </div>
    </div>
  );
});

ResourceCard.displayName = 'ResourceCard';
