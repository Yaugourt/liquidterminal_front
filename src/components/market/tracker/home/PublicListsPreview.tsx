"use client";

import { useRouter } from "next/navigation";
import { usePublicListsPreview } from "@/services/market/tracker/hooks/usePublicListsPreview";
import { PublicWalletListCard } from "../walletlists/PublicWalletListCard";
import { List } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardHead } from "@/components/common";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { WalletList } from "@/services/market/tracker/types";

/**
 * Composant preview des listes publiques pour la home page du tracker
 * Affiche 6 listes publiques récentes/populaires
 */
export function PublicListsPreview() {
  const router = useRouter();
  const { lists, isLoading, error, refetch } = usePublicListsPreview(6);

  const handlePreview = (list: WalletList) => {
    router.push(`/market/tracker/public-lists/${list.id}`);
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHead
        title="Public Lists"
        subtitle="Curated wallet collections"
        href="/market/tracker/public-lists"
        viewAllLabel="Browse all"
      />

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Loading state */}
        {isLoading && (
          <LoadingState message="Loading public lists..." size="md" withCard={false} />
        )}

        {/* Error state */}
        {error && !isLoading && (
          <ErrorState title="Failed to load public lists" onRetry={() => refetch()} withCard={false} />
        )}

        {/* Lists grid */}
        {!isLoading && !error && (
          <>
            {lists.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <List className="h-12 w-12 text-text-tertiary mb-3" />
                <p className="text-text-secondary">No public lists available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lists.slice(0, 4).map((list) => (
                  <PublicWalletListCard
                    key={list.id}
                    list={list}
                    onPreview={handlePreview}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
