"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { PublicWalletListCard } from "./PublicWalletListCard";
import { PublicWalletListPreviewDialog } from "./PublicWalletListPreviewDialog";
import { getPublicWalletLists } from "@/services/market/tracker/walletlist.service";
import { WalletList } from "@/services/market/tracker/types";
import { toast } from "sonner";

interface PublicWalletListsProps {
  searchQuery?: string;
}

export function PublicWalletLists({ searchQuery = "" }: PublicWalletListsProps) {
  const [lists, setLists] = useState<WalletList[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedList, setSelectedList] = useState<WalletList | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Latest request: an answer that is no longer the latest (older query, or a
  // "load more" overtaken by a new search) must not write.
  const requestSeq = useRef(0);

  // Typing fires one request per settled query, not one per keystroke
  const [query, setQuery] = useState(searchQuery);
  useEffect(() => {
    const timer = setTimeout(() => setQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadLists = useCallback(async (pageNum: number, isReset = false) => {
    const seq = ++requestSeq.current;

    try {
      setLoading(true);

      const params: Record<string, unknown> = {
        page: pageNum,
        limit: 20,
        sort: 'createdAt',
        order: 'desc'
      };

      if (query.trim()) {
        params.search = query.trim();
      }

      const response = await getPublicWalletLists(params);
      if (seq !== requestSeq.current) return;

      if (response.data) {
        setLists(prev => isReset ? response.data : [...prev, ...response.data]);
        setHasMore(response.pagination?.hasNext ?? false);
        setPage(pageNum);
      }
    } catch {
      if (seq === requestSeq.current) toast.error('Failed to load public lists');
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
        setInitialLoading(false);
      }
    }
  }, [query]);

  // First load, and reset when the search changes
  useEffect(() => {
    setLists([]);
    setPage(1);
    setHasMore(true);
    loadLists(1, true);
  }, [loadLists]);

  // Load more handler
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadLists(page + 1);
    }
  };

  // Handle preview
  const handlePreview = (list: WalletList) => {
    setSelectedList(list);
    setIsPreviewOpen(true);
  };

  if (initialLoading) {
    return (
      <div className="py-20">
        <LoadingState message="Loading public lists..." size="md" withCard={false} />
      </div>
    );
  }

  if (lists.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-text-primary mb-2">No public lists found</h3>
          <p className="text-text-secondary">
            {searchQuery
              ? `No results for "${searchQuery}"`
              : "Be the first to create and share a public wallet list!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header stats */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-text-secondary">
            {lists.length} list{lists.length !== 1 ? 's' : ''} loaded
            {searchQuery && ` for "${searchQuery}"`}
          </div>
        </div>

        {/* Grid of lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <PublicWalletListCard
              key={list.id}
              list={list}
              onPreview={handlePreview}
            />
          ))}
        </div>

        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              className="bg-brand hover:bg-brand text-brand-text-on font-medium"
            >
              {loading ? (
                <>
                  <InlineSpinner className="mr-2" />
                  Loading...
                </>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}

        {/* End message */}
        {!hasMore && lists.length > 0 && (
          <div className="text-center py-4 text-sm text-text-secondary">
            You&apos;ve reached the end of the list
          </div>
        )}
      </div>

      {/* Preview Dialog */}
      <PublicWalletListPreviewDialog
        list={selectedList}
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
      />
    </>
  );
}

