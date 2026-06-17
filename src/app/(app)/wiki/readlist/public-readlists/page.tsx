"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePageTitle } from "@/store/use-page-title";
import { usePublicReadLists } from "@/services/wiki/readList/hooks/usePublicReadLists";
import { PublicReadListCard } from "@/components/wiki/readList/PublicReadListCard";
import { PublicReadListDetails } from "@/components/wiki/readList/PublicReadListDetails";
import { PageHeader, Pagination, SkeletonGrid } from "@/components/common";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const { setTitle } = usePageTitle();
  const [selectedReadList, setSelectedReadList] = useState<PublicReadList | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setTitle("Public Read Lists");
  }, [setTitle]);

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
        <Card padding="lg" className="max-w-md w-full mx-4 text-center space-y-4">
          <div className="w-16 h-16 bg-danger/10 rounded-lg flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-danger" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary">Failed to load</h2>
          <p className="text-text-secondary text-sm">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-brand hover:bg-brand/90 text-brand-text-on font-semibold"
          >
            Try Again
          </Button>
        </Card>
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
          <PageHeader
            breadcrumb={
              <Link
                href="/wiki/readlist"
                className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Read List
              </Link>
            }
            title="Public Read Lists"
            description={
              <>
                Discover curated reading lists from the community
                {pagination && (
                  <span className="ml-1.5 text-text-tertiary">· {pagination.total} lists</span>
                )}
              </>
            }
          >
            {/* Search + Sort */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-tertiary" />
                <Input
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Search public lists..."
                  className="pl-9 h-9 bg-base border-border-subtle text-text-primary text-sm rounded-lg placeholder:text-text-tertiary focus:border-brand/50"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-text-tertiary">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Sort:</span>
                </div>
                <div className="flex bg-surface-2 border border-border-subtle rounded-lg p-1 gap-0.5">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSortChange(opt.value)}
                      className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${params.sort === opt.value
                        ? "text-brand-text-on"
                        : "text-text-tertiary hover:text-text-primary"
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
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-surface-2 border border-border-subtle hover:border-border-default text-text-tertiary hover:text-text-primary rounded-lg text-xs transition-all"
                  title={`Order: ${params.order === "asc" ? "Ascending" : "Descending"}`}
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  {params.order === "asc" ? "Asc" : "Desc"}
                </button>
              </div>
            </div>
          </PageHeader>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {loading ? (
              <SkeletonGrid
                key="loading"
                count={8}
                columns="grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                gap="gap-5"
                lines={2}
              />
            ) : readLists.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card padding="lg" className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-brand/10 rounded-lg flex items-center justify-center">
                    <Search className="w-8 h-8 text-brand" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
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
                </Card>
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
