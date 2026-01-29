"use client";

import Link from "next/link";
import { usePublicListsPreview } from "@/services/market/tracker/hooks/usePublicListsPreview";
import { PublicWalletListCard } from "../walletlists/PublicWalletListCard";
import { Loader2, List, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Composant preview des listes publiques pour la home page du tracker
 * Affiche 6 listes publiques récentes/populaires
 */
export function PublicListsPreview() {
  const { lists, isLoading, error, refetch } = usePublicListsPreview(6);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-accent/10 rounded-lg">
            <List className="h-5 w-5 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Public Lists</h2>
            <p className="text-text-muted text-sm">Curated wallet collections</p>
          </div>
        </div>
        <Link href="/market/tracker/public-lists">
          <Button
            variant="ghost"
            size="sm"
            className="text-brand-accent hover:text-brand-accent hover:bg-brand-accent/10"
          >
            Browse All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center h-full min-h-[300px]">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
              <span className="text-text-muted text-sm">Loading public lists...</span>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-center">
            <p className="text-rose-400 text-sm mb-3">Failed to load public lists</p>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="border-rose-500/50 text-rose-400 hover:bg-rose-500/10"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Lists grid */}
        {!isLoading && !error && (
          <>
            {lists.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <List className="h-12 w-12 text-text-muted mb-3" />
                <p className="text-text-secondary">No public lists available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lists.slice(0, 4).map((list) => (
                  <PublicWalletListCard
                    key={list.id}
                    list={list}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
