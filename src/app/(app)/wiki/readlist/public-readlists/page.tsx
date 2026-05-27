"use client";

import { useState, useCallback, useRef } from "react";
import { usePublicReadLists } from "@/services/wiki/readList/hooks/usePublicReadLists";
import { PublicReadListCard } from "@/components/wiki/readList/PublicReadListCard";
import { PublicReadListDetails } from "@/components/wiki/readList/PublicReadListDetails";
import { Pagination } from "@/components/common";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  Globe,
  ArrowUpDown,
} from "lucide-react";
import { InlineSpinner } from "@/components/ui/inline-spinner";
import { PublicReadList } from "@/services/wiki/readList/types";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

const SORT_OPTIONS = [
  { value: "updatedAt", label: "Recently Updated" },
  { value: "createdAt", label: "Recently Created" },
  { value: "name", label: "Name" },
] as const;

export default function PublicReadListsPage() {
  const [selectedReadList, setSelectedReadList] = useState<PublicReadList | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    readLists,
    loading,
    error,
    pagination,
    params,
    updateParams,
    copyReadList
  } = usePublicReadLists();

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      updateParams({ search: value });
    }, 350);
  }, [updateParams]);

  const handleSortChange = useCallback((sort: typeof SORT_OPTIONS[number]["value"]) => {
    updateParams({ sort, order: "desc" });
  }, [updateParams]);

  const handlePageChange = useCallback((page: number) => {
    updateParams({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [updateParams]);

  const handleCopyReadList = useCallback(async (readListId: number) => {
    await copyReadList(readListId);
  }, [copyReadList]);

  const handleSelectReadList = useCallback((readList: PublicReadList) => {
    setSelectedReadList(readList);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedReadList(null);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="bg-surface/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl shadow-black/20">
          <div className="text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Failed to load</h2>
            <p className="text-text-secondary mb-6 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand hover:bg-brand/90 text-brand-text-on font-semibold rounded-lg transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {selectedReadList ? (
        <motion.div
          key="details"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <PublicReadListDetails
            readList={selectedReadList}
            onBack={handleBackToList}
            onCopy={async () => {
              if (selectedReadList) await handleCopyReadList(selectedReadList.id);
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-brand" />
                </div>
                <h1 className="text-xl font-bold text-white">Public Read Lists</h1>
              </div>
              <p className="text-sm text-text-secondary">
                Discover curated reading lists from the community
                {pagination && (
                  <span className="ml-1.5 text-text-tertiary">· {pagination.total} lists</span>
                )}
              </p>
            </div>
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
              <Input
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search public lists..."
                className="pl-9 h-9 bg-surface/60 border-border-subtle text-white text-sm rounded-lg placeholder:text-text-tertiary focus:border-brand/50"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-text-tertiary">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Sort:</span>
              </div>
              <div className="flex bg-surface/60 border border-border-subtle rounded-lg p-1 gap-0.5">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortChange(opt.value)}
                    className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${params.sort === opt.value
                      ? "text-brand-text-on"
                      : "text-text-tertiary hover:text-white"
                      }`}
                  >
                    {params.sort === opt.value && (
                      <motion.div
                        layoutId="sort-tab"
                        className="absolute inset-0 bg-brand rounded-md"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10">{opt.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => updateParams({ order: params.order === "asc" ? "desc" : "asc" })}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-surface/60 border border-border-subtle hover:border-border-default text-text-tertiary hover:text-white rounded-lg text-xs transition-all"
                title={`Order: ${params.order === "asc" ? "Ascending" : "Descending"}`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {params.order === "asc" ? "Asc" : "Desc"}
              </button>
            </div>
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-surface/60 border border-border-subtle rounded-2xl p-4 animate-pulse space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/5 rounded w-3/4" />
                        <div className="h-3 bg-white/5 rounded w-full" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-white/5 rounded-full" />
                      <div className="h-3 bg-white/5 rounded w-24" />
                    </div>
                    <div className="h-8 bg-white/5 rounded-xl" />
                  </div>
                ))}
              </motion.div>
            ) : readLists.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface/60 backdrop-blur-md border border-white/5 rounded-2xl p-12"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-brand/10 rounded-2xl flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-brand" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {params.search ? "No results found" : "No public lists yet"}
                  </h3>
                  <p className="text-text-secondary text-sm">
                    {params.search
                      ? `No lists match "${params.search}"`
                      : "Be the first to create a public read list!"
                    }
                  </p>
                  {params.search && (
                    <button
                      onClick={() => { setSearchInput(""); updateParams({ search: "" }); }}
                      className="mt-4 text-sm text-brand hover:text-brand/80 transition-colors"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={`grid-${params.page}-${params.sort}-${params.search}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
              >
                {readLists.map((readList, i) => (
                  <motion.div
                    key={readList.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.32) }}
                  >
                    <PublicReadListCard
                      readList={readList}
                      isSelected={false}
                      onSelect={() => handleSelectReadList(readList)}
                      onCopy={() => handleCopyReadList(readList.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center pt-2"
            >
              <Pagination
                total={pagination.total}
                page={pagination.page - 1}
                rowsPerPage={pagination.limit}
                onPageChange={(page) => handlePageChange(page + 1)}
                onRowsPerPageChange={() => { }}
              />
            </motion.div>
          )}

          {/* Stats footer */}
          {pagination && !loading && readLists.length > 0 && (
            <div className="flex items-center justify-center gap-1 text-xs text-text-tertiary pt-1">
              <InlineSpinner className={`w-3 h-3 ${loading ? "" : "opacity-0 animate-none"}`} />
              Showing {readLists.length} of {pagination.total} lists
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
