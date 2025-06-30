import { memo, useMemo, useState } from "react";
import { TwapTabButtons } from "./TwapTabButtons";
import { TwapTable } from "./TwapTable";
import { TwapTableData } from "./types";
import { useTwapOrders } from "@/services/market/order";
import { EnrichedTwapOrder } from "@/services/market/order/types";

// Transformer les données enrichies en format tableau
const transformTwapData = (enrichedOrders: EnrichedTwapOrder[]): TwapTableData[] => {
  return enrichedOrders.map(order => ({
    id: order.hash,
    type: order.action.twap.b ? 'Buy' : 'Sell',
    value: order.totalValueUSD,
    token: order.tokenSymbol,
    amount: order.action.twap.s,
    user: order.user,
    progression: Math.round(order.progressionPercent),
    time: order.time,
    hash: order.hash,
    duration: order.action.twap.m,
    reduceOnly: order.action.twap.r,
    ended: order.ended,
    error: order.error
  }));
};

export const TwapSection = memo(() => {
  const [activeTab, setActiveTab] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Utiliser le hook TWAP avec filtre pour les ordres actifs
  const { orders: enrichedOrders, isLoading, error } = useTwapOrders({
    limit: 1000,
    status: "active" // Seulement les ordres actifs
  });

  // Transformer les données enrichies en format tableau
  const twapTableData = useMemo(() => transformTwapData(enrichedOrders), [enrichedOrders]);

  // Obtenir les tokens uniques pour les tabs
  const availableTokens = useMemo(() => {
    const tokensSet = new Set(twapTableData.map((twap: TwapTableData) => twap.token));
    const tokens = Array.from(tokensSet);
    return tokens.sort();
  }, [twapTableData]);

  // Filtrer les données selon le tab actif et trier par valeur décroissante
  const filteredTwaps = useMemo(() => {
    let filtered = activeTab === "ALL" 
      ? twapTableData 
      : twapTableData.filter((twap: TwapTableData) => twap.token === activeTab);
    
    // Tri par valeur décroissante par défaut
    return filtered.sort((a, b) => b.value - a.value);
  }, [twapTableData, activeTab]);

  // Reset pagination quand le tab change
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setCurrentPage(0);
  };

  // Pagination
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTwaps = filteredTwaps.slice(startIndex, endIndex);

  const paginationProps = {
    total: filteredTwaps.length,
    page: currentPage,
    rowsPerPage,
    onPageChange: setCurrentPage,
    onRowsPerPageChange: setRowsPerPage,
    showPagination: true
  };

  return (
    <div className="w-full">
      <TwapTabButtons 
        activeTab={activeTab} 
        setActiveTab={handleTabChange}
        availableTokens={availableTokens}
      />

      <div className="min-h-[300px]">
        <TwapTable
          twaps={paginatedTwaps}
          isLoading={isLoading}
          error={error}
          {...paginationProps}
        />
      </div>
    </div>
  );
});

TwapSection.displayName = 'TwapSection'; 