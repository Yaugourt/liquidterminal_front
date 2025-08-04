"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { usePublicReadLists } from "@/services/education/readList/hooks/usePublicReadLists";
import { PublicReadListCard } from "@/components/education/readList/PublicReadListCard";
import { PublicReadListDetails } from "@/components/education/readList/PublicReadListDetails";
import { Pagination } from "@/components/common/pagination";
import { Loader2, BookOpen } from "lucide-react";
import { PublicReadList } from "@/services/education/readList/types";

export default function PublicReadListsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Public Read Lists</h2>
          <p className="text-[#FFFFFF80] mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#83E9FF] text-black rounded-lg hover:bg-[#83E9FF]/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="bg-[#051728] hover:bg-[#112941]"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content */}
      <div className="">
        <Header customTitle="Public Read Lists" showFees={true} />
        
        <div className="p-2 lg:hidden">
          <SearchBar placeholder="Search public read lists..." />
        </div>

        <main className="px-2 py-2 sm:px-4 sm:py-4 lg:px-6 xl:px-12 lg:py-6 space-y-8 max-w-[1920px] mx-auto">
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
                    <Loader2 className="w-8 h-8 text-[#83E9FF] animate-spin mr-3" />
                    <span className="text-white">Loading public read lists...</span>
                  </div>
                ) : readLists.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-[#FFFFFF40] mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No public read lists found</h3>
                    <p className="text-[#FFFFFF80]">
                      {params.search ? 'Try adjusting your search terms' : 'Be the first to create a public read list!'}
                    </p>
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