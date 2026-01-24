import { memo, useMemo, useState, useRef, useEffect } from "react";
import { TwapTable } from "./TwapTable";
import { TwapTableData, TwapTabButtonsProps } from "./types";
import { useTwapOrders } from "@/services/market/order";
import { EnrichedTwapOrder } from "@/services/market/order/types";
import { ChevronLeft, ChevronRight, Zap } from "lucide-react";

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

const TwapTabButtons = memo(({
  activeTab,
  setActiveTab,
  availableTokens
}: TwapTabButtonsProps) => {
  const tabs = useMemo(() => [
    { key: 'ALL', label: 'All Tokens' },
    ...availableTokens.map(token => ({ key: token, label: token }))
  ], [availableTokens]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Vérifier si le défilement est possible
  const checkScrollability = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth
      );
    }
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);

      // Ajouter le support de la molette horizontale
      const handleWheel = (e: WheelEvent) => {
        if (e.deltaX !== 0) {
          // Si c'est déjà un scroll horizontal, le laisser passer
          return;
        }
        if (e.deltaY !== 0) {
          // Convertir le scroll vertical en horizontal
          e.preventDefault();
          container.scrollBy({ left: e.deltaY > 0 ? 60 : -60, behavior: 'smooth' });
        }
      };

      container.addEventListener('wheel', handleWheel);

      return () => {
        container.removeEventListener('scroll', checkScrollability);
        container.removeEventListener('wheel', handleWheel);
      };
    }
  }, [tabs]);

  // Fonctions de défilement
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -150, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex items-center p-4 border-b border-border-subtle bg-black/20 w-full overflow-hidden">
      {/* Header Title */}
      <div className="flex items-center gap-2 mr-4 flex-shrink-0">
        <Zap size={16} className="text-brand-accent" />
        <span className="text-sm font-semibold text-white">Active Twaps</span>
      </div>

      {/* Scrollable Tabs */}
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-hidden">
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-text-secondary hover:text-white bg-white/5 rounded-full transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-md text-label transition-all whitespace-nowrap border ${activeTab === tab.key
                  ? 'bg-brand-accent/10 border-brand-accent/20 text-brand-accent shadow-sm'
                  : 'bg-white/5 border-transparent text-text-secondary hover:text-zinc-200 hover:bg-white/10'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-text-secondary hover:text-white bg-white/5 rounded-full transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
});
TwapTabButtons.displayName = 'TwapTabButtons';

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
    const filtered = activeTab === "ALL"
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