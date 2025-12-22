"use client";

import { useState } from "react";
import { usePublicReadLists } from "@/services/wiki/readList/hooks/usePublicReadLists";
import { PublicReadListCard } from "@/components/wiki/readList/PublicReadListCard";
import { PublicReadListDetails } from "@/components/wiki/readList/PublicReadListDetails";
import { Pagination } from "@/components/common/pagination";
import { Loader2, BookOpen } from "lucide-react";
import { PublicReadList } from "@/services/wiki/readList/types";

export default function PublicReadListsPage() {
  const [selectedReadList, setSelectedReadList] = useState<PublicReadList | null>(null);
  const {
    readLists,
    loading,
    error,
    pagination,
    params,
    updateParams,
    copyReadList
  } = usePublicReadLists();

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleCopyReadList = async (readListId: number) => {
    const success = await copyReadList(readListId);
    if (success) {
      // Optionally refresh the list or show success message
    }
  };

  const handleSelectReadList = (readList: PublicReadList) => {
    setSelectedReadList(readList);
  };

  const handleBackToList = () => {
    setSelectedReadList(null);
  };

  const handleCopySelectedList = async () => {
    if (selectedReadList) {
      await handleCopyReadList(selectedReadList.id);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl shadow-black/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Public Read Lists</h2>
            <p className="text-zinc-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-accent hover:bg-brand-accent/90 text-brand-tertiary font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedReadList ? (
        <PublicReadListDetails
          readList={selectedReadList}
          onBack={handleBackToList}
          onCopy={handleCopySelectedList}
        />
      ) : (
        <>
          {/* Content */}
          <div className="mb-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center">
                  <Loader2 className="w-6 h-6 text-brand-accent animate-spin mb-2" />
                  <span className="text-zinc-500 text-sm">Loading public read lists...</span>
                </div>
              </div>
            ) : readLists.length === 0 ? (
              <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-8">
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-brand-accent/10 rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-brand-accent" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">No public read lists found</h3>
                  <p className="text-zinc-400">
                    {params.search ? 'Try adjusting your search terms' : 'Be the first to create a public read list!'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {readLists.map((readList) => (
                  <PublicReadListCard
                    key={readList.id}
                    readList={readList}
                    isSelected={false}
                    onSelect={() => handleSelectReadList(readList)}
                    onCopy={() => handleCopyReadList(readList.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                total={pagination.total}
                page={pagination.page - 1}
                rowsPerPage={pagination.limit}
                onPageChange={(page) => handlePageChange(page + 1)}
                onRowsPerPageChange={() => { }}
              />
            </div>
          )}
        </>
      )}
    </>
  );
}