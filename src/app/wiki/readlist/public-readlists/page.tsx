"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { usePublicReadLists } from "@/services/wiki/readList/hooks/usePublicReadLists";
import { PublicReadListCard } from "@/components/wiki/readList/PublicReadListCard";
import { PublicReadListDetails } from "@/components/wiki/readList/PublicReadListDetails";
import { Pagination } from "@/components/common/pagination";
import { Loader2, BookOpen } from "lucide-react";
import { PublicReadList } from "@/services/wiki/readList/types";
import { useWindowSize } from "@/hooks/use-window-size";

export default function PublicReadListsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedReadList, setSelectedReadList] = useState<PublicReadList | null>(null);
  const { width } = useWindowSize();
  const { 
    readLists, 
    loading, 
    error, 
    pagination, 
    params, 
    updateParams, 
    copyReadList 
  } = usePublicReadLists();

  useEffect(() => {
    if (width && width >= 1024) {
      setIsSidebarOpen(false);
    }
  }, [width]);

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
      <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505] flex items-center justify-center">
        <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl shadow-black/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Public Read Lists</h2>
            <p className="text-zinc-400 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#83E9FF] hover:bg-[#83E9FF]/90 text-[#051728] font-semibold rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-zinc-100 font-inter bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1a2c38] via-[#0B0E14] to-[#050505]">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="">
        {/* Header with glass effect */}
        <div className="sticky top-0 z-40 backdrop-blur-xl bg-[#0B0E14]/80 border-b border-white/5">
          <Header customTitle="Public Read Lists" showFees={true} />
        </div>
        
        {/* Mobile search bar */}
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search public read lists..." />
        </div>

        <main className="px-6 py-8 space-y-8 max-w-[1920px] mx-auto">
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
                      <Loader2 className="w-6 h-6 text-[#83E9FF] animate-spin mb-2" />
                      <span className="text-zinc-500 text-sm">Loading public read lists...</span>
                    </div>
                  </div>
                ) : readLists.length === 0 ? (
                  <div className="bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 p-8">
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-[#83e9ff]/10 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-[#83E9FF]" />
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
                    onRowsPerPageChange={() => {}}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
} 