"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
  
  // Pour éviter les double-loads
  const isLoadingRef = useRef(false);

  // Reset when search changes
  useEffect(() => {
    setLists([]);
    setPage(1);
    setHasMore(true);
    loadLists(1, true);
  }, [searchQuery]);

  const loadLists = useCallback(async (pageNum: number, isReset = false) => {
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      
      const params: Record<string, unknown> = {
        page: pageNum,
        limit: 20,
        sort: 'createdAt',
        order: 'desc'
      };
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await getPublicWalletLists(params);
      
      if (response.data) {
        setLists(prev => isReset ? response.data : [...prev, ...response.data]);
        setHasMore(response.pagination?.hasNext ?? false);
        setPage(pageNum);
      }
    } catch {
      toast.error('Failed to load public lists');
    } finally {
      setLoading(false);
      setInitialLoading(false);
      isLoadingRef.current = false;
    }
  }, [searchQuery]);

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

  // Initial load
  useEffect(() => {
    loadLists(1, true);
  }, []);

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        <p className="text-gray-400">Loading public lists...</p>
      </div>
    );
  }

  if (lists.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">No public lists found</h3>
          <p className="text-gray-400">
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
          <div className="text-sm text-gray-400">
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
              className="bg-[#83E9FF] hover:bg-[#6bd4f0] text-[#051728] font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          <div className="text-center py-4 text-sm text-gray-400">
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

