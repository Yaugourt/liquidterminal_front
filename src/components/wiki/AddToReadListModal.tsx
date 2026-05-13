"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, BookOpen, ListPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { ReadList } from "@/services/wiki/readList/types";

interface AddToReadListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Title shown in the header subtitle (typically the resource title). */
  resourceLabel: string;
  /** All available read lists. */
  readLists: ReadList[];
  /** Current search query (filters list by name). */
  search: string;
  onSearchChange: (search: string) => void;
  /** Submit handler. Called when the user clicks a list to add into. */
  onAddToList: (readListId: number) => void;
  /** True while an "add" call is in flight (disables list buttons). */
  isAdding: boolean;
  /** The list ID currently being added to (shows a spinner on that item). */
  addingToListId: number | null;
  onCancel: () => void;
}

/**
 * Modal that asks the user which read list to add a resource into.
 *
 * Extracted from `ResourceCard` so the card stays focused on rendering.
 * Could be promoted to `common/` once a second consumer needs it.
 */
export function AddToReadListModal({
  open,
  onOpenChange,
  resourceLabel,
  readLists,
  search,
  onSearchChange,
  onAddToList,
  isAdding,
  addingToListId,
  onCancel,
}: AddToReadListModalProps) {
  const filteredLists = useMemo(() => {
    if (!search.trim()) return readLists;
    return readLists.filter((l) =>
      l.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [readLists, search]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm bg-brand-secondary border-border-hover p-0 z-[9999] overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border-subtle bg-gradient-to-r from-brand-accent/5 to-transparent">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center flex-shrink-0">
                <ListPlus className="w-4 h-4 text-brand-accent" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-sm font-bold text-white">
                  Add to Read List
                </DialogTitle>
                <p className="text-xs text-text-muted mt-0.5 truncate">{resourceLabel}</p>
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
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search lists..."
                className="pl-9 h-8 text-xs bg-brand-dark border-border-subtle text-white rounded-lg placeholder:text-text-muted focus:border-brand-accent/50"
              />
            </div>
          </div>
        )}

        {/* List */}
        <div className="px-4 py-3 max-h-[280px] overflow-y-auto space-y-1.5 scrollbar-brand">
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
                No lists match &quot;{search}&quot;
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
                      onAddToList(readList.id);
                    }}
                    disabled={isAdding}
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
              onCancel();
            }}
            className="px-4 py-2 text-sm interactive-secondary rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
