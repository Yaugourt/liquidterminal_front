import { Plus, BookOpen, Search, Globe, Lock, CheckCircle2 } from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { ReadList, ReadListItem } from "@/services/wiki";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ReadListItemCard } from "./ReadListItemCard";
import { useLinkPreviewsBatch } from "@/services/wiki/linkPreview/hooks/hooks";

interface ReadListContentProps {
  activeList?: ReadList;
  items?: ReadListItem[];
  itemsLoading: boolean;
  itemsPagination?: { page: number; limit: number; total: number; hasNext: boolean } | null;
  onRemoveItem: (itemId: number) => void;
  onToggleRead: (itemId: number, isRead: boolean) => void;
  onCreateList: () => void;
  onLoadMore?: () => void;
  isMounted?: boolean;
}

const ReadListItemSkeleton = () => (
  <Card className="animate-pulse">
    <div className="w-full h-40 bg-white/5"></div>
    <div className="p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="h-5 bg-white/5 rounded w-24"></div>
        <div className="w-3 h-3 bg-white/5 rounded"></div>
      </div>
      <div className="h-4 bg-white/5 rounded w-full"></div>
      <div className="h-3 bg-white/5 rounded w-3/4"></div>
      <div className="h-3 bg-white/5 rounded w-1/2"></div>
      <div className="flex items-center justify-between pt-2 border-t border-border-subtle/50">
        <div className="h-3 bg-white/5 rounded w-20"></div>
        <div className="h-5 bg-white/5 rounded w-14"></div>
      </div>
    </div>
  </Card>
);

const TABS = [
  { key: "all" as const, label: "All" },
  { key: "unread" as const, label: "Unread" },
  { key: "read" as const, label: "Read" },
];

export function ReadListContent({
  activeList,
  items,
  itemsLoading,
  itemsPagination,
  onRemoveItem,
  onToggleRead,
  onCreateList,
  onLoadMore,
  isMounted = false,
}: ReadListContentProps) {
  const [enrichedItems, setEnrichedItems] = useState<ReadListItem[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "read" | "unread">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const urls = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    return items
      .map(item => item.resource?.url)
      .filter((url): url is string => !!url && url.startsWith('http'));
  }, [items]);

  const { getPreview } = useLinkPreviewsBatch(urls);

  useEffect(() => {
    setEnrichedItems(Array.isArray(items) ? items : []);
  }, [items]);

  const filteredItems = useMemo(() => {
    let filtered = enrichedItems;
    if (activeTab === "read") filtered = filtered.filter(item => item.isRead);
    if (activeTab === "unread") filtered = filtered.filter(item => !item.isRead);
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.resource?.url?.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [enrichedItems, activeTab, searchTerm]);

  const totalItems = enrichedItems.length;
  const readItems = enrichedItems.filter(item => item.isRead).length;
  const unreadItems = totalItems - readItems;
  const readProgress = totalItems > 0 ? (readItems / totalItems) * 100 : 0;

  if (!isMounted) return null;

  if (!activeList) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8"
      >
        <div className="w-20 h-20 mx-auto mb-5 bg-brand/10 rounded-2xl flex items-center justify-center">
          <BookOpen className="w-10 h-10 text-brand" />
        </div>
        <h3 className="text-text-primary font-semibold text-lg mb-2">No read list selected</h3>
        <p className="text-text-secondary text-sm max-w-xs">Select a list from the sidebar or create a new one to get started</p>
        <Button
          onClick={onCreateList}
          className="mt-6 bg-brand hover:bg-brand/90 text-brand-text-on font-semibold rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Read List
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-border-subtle space-y-4 bg-gradient-to-r from-brand/3 to-transparent">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-text-primary text-xl font-bold truncate">{activeList.name}</h1>
              {activeList.isPublic ? (
                <span className="flex items-center gap-1 text-label bg-brand/10 text-brand px-2 py-0.5 rounded-md border border-brand/20">
                  <Globe className="w-3 h-3" />
                  Public
                </span>
              ) : (
                <span className="flex items-center gap-1 text-label bg-white/5 text-text-tertiary px-2 py-0.5 rounded-md">
                  <Lock className="w-3 h-3" />
                  Private
                </span>
              )}
            </div>
            {activeList.description && (
              <p className="text-text-secondary mt-1 text-sm line-clamp-1">{activeList.description}</p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-center">
              <div className="text-text-primary font-bold text-lg leading-none">{totalItems}</div>
              <div className="text-text-tertiary text-xs mt-0.5">total</div>
            </div>
            <div className="w-px h-8 bg-border-subtle" />
            <div className="text-center">
              <div className="text-emerald-400 font-bold text-lg leading-none">{readItems}</div>
              <div className="text-text-tertiary text-xs mt-0.5">read</div>
            </div>
            <div className="w-px h-8 bg-border-subtle" />
            <div className="text-center">
              <div className="text-gold font-bold text-lg leading-none">{unreadItems}</div>
              <div className="text-text-tertiary text-xs mt-0.5">unread</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {totalItems > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {Math.round(readProgress)}% complete
              </span>
              <span>{readItems}/{totalItems} read</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 to-brand rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${readProgress}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Search + Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-3.5 h-3.5" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className="pl-9 h-9 bg-base border-border-subtle text-text-primary text-sm rounded-lg placeholder:text-text-tertiary focus:border-brand/50"
            />
          </div>

          <div className="flex bg-base rounded-lg p-1 border border-border-subtle gap-0.5 self-start">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${activeTab === tab.key
                  ? "text-brand-text-on"
                  : "text-text-tertiary hover:text-text-primary"
                  }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute inset-0 bg-brand rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                {tab.key === "unread" && unreadItems > 0 && (
                  <span className={`relative z-10 ml-1.5 text-label px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-surface/20 text-brand-text-on" : "bg-white/10 text-text-tertiary"}`}>
                    {unreadItems}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-auto p-5">
        <AnimatePresence mode="wait">
          {itemsLoading && filteredItems.length === 0 ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <ReadListItemSkeleton key={i} />
              ))}
            </motion.div>
          ) : filteredItems.length > 0 ? (
            <motion.div
              key={`items-${activeTab}-${searchTerm}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredItems.map((item, i) => (
                  <motion.div
                    key={`item-${item.id}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  >
                    <ReadListItemCard
                      item={item}
                      preview={getPreview(item.resource?.url || '')}
                      onRemoveItem={onRemoveItem}
                      onToggleRead={onToggleRead}
                    />
                  </motion.div>
                ))}
              </div>

              {itemsPagination?.hasNext && onLoadMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center mt-8"
                >
                  <Button
                    onClick={onLoadMore}
                    disabled={itemsLoading}
                    className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold rounded-lg px-6"
                  >
                    {itemsLoading ? (
                      <>
                        <InlineSpinner className="mr-2" />
                        Loading...
                      </>
                    ) : (
                      `Load More (${itemsPagination.total - filteredItems.length} remaining)`
                    )}
                  </Button>
                </motion.div>
              )}

              {itemsLoading && filteredItems.length > 0 && (
                <div className="flex justify-center mt-4">
                  <InlineSpinner className="w-5 h-5 text-brand" />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-brand/10 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-text-primary text-base font-semibold mb-2">No items found</h3>
              <p className="text-text-secondary text-sm max-w-xs">
                {searchTerm
                  ? `No results for "${searchTerm}"`
                  : items && items.length > 0
                    ? "No items match the current filter"
                    : "Add resources from the Wiki to get started"
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 text-sm text-brand hover:text-brand/80 transition-colors"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
