"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { PerpMarketData } from "@/services/market/perp/types";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";

// Types
export interface Holding {
  coin: string;
  token: string;
  total: string;
  entryNtl: string;
  price?: string;
  pnl?: string;
  pnlPercentage?: string;
  logo?: string;
}

export interface PerpHolding {
  coin: string;
  type: 'Short' | 'Long';
  marginUsed: string;
  positionValue: string;
  entryPrice: string;
  liquidation: string;
  logo?: string;
}

export interface PerpHoldingDisplay extends PerpHolding {
  id: string;
  marginUsedValue: number;
  positionValueNum: number;
  entryPriceNum: number;
  liquidationNum: number;
}

export interface HoldingDisplay extends Omit<Holding, 'pnl' | 'pnlPercentage' | 'price'> {
  id: string;
  totalValue: number;
  price: number;
  pnl: number;
  pnlPercentage: number;
  entryPrice: number;
}

type SpotSortKey = keyof HoldingDisplay;
type PerpSortKey = keyof PerpHoldingDisplay;
type SortableKey = SpotSortKey | PerpSortKey;

type SortConfig = {
  key: SortableKey | null;
  direction: "asc" | "desc";
};

interface AssetsTableProps {
  holdings: Holding[] | PerpHolding[];
  loading: boolean;
  type: 'spot' | 'perp';
}

// Composant pour l'en-tête de colonne triable
const SortableColumnHeader = ({ 
  label, 
  sortKey, 
  onSort, 
  className = "" 
}: { 
  label: string; 
  sortKey: SortableKey; 
  onSort: (key: SortableKey) => void;
  className?: string;
}) => (
  <Button
    variant="ghost"
    onClick={() => onSort(sortKey)}
    className={`text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center ${className}`}
  >
    {label}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

// Composant pour l'état de chargement ou vide
const TableLoadingOrEmpty = ({ 
  colSpan, 
  isLoading, 
  isEmpty = false,
  type
}: { 
  colSpan: number; 
  isLoading: boolean;
  isEmpty?: boolean;
  type: 'spot' | 'perp';
}) => (
  <TableRow>
    <TableCell colSpan={type === 'perp' ? 7 : 5} className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        {isLoading ? (
          <>
            <Loader2 className="w-10 h-10 mb-4 text-[#83E9FF4D] animate-spin" />
            <p className="text-white text-lg">Chargement...</p>
          </>
        ) : isEmpty ? (
          <>
            <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
            <p className="text-white text-lg">Aucune position trouvée</p>
            <p className="text-[#FFFFFF80] text-sm mt-2">Ajoutez une position ou vérifiez plus tard</p>
          </>
        ) : null}
      </div>
    </TableCell>
  </TableRow>
);

// Composant pour l'en-tête du tableau
const TableHeaderComponent = ({ 
  onSort,
  type,
}: { 
  onSort: (key: SortableKey) => void;
  type: 'spot' | 'perp';
}) => {
  if (type === 'perp') {
    return (
      <TableHeader>
        <TableRow className="border-none bg-[#051728]">
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pl-4">
            <SortableColumnHeader 
              label="Name" 
              sortKey="coin" 
              onSort={onSort} 
            />
          </TableHead>
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
            <SortableColumnHeader 
              label="Type" 
              sortKey="type" 
              onSort={onSort}
              className="ml-auto justify-end w-full" 
            />
          </TableHead>
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
            <SortableColumnHeader 
              label="Margin used" 
              sortKey="marginUsed" 
              onSort={onSort}
              className="ml-auto justify-end w-full" 
            />
          </TableHead>
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
            <SortableColumnHeader 
              label="Position value" 
              sortKey="positionValue" 
              onSort={onSort}
              className="ml-auto justify-end w-full" 
            />
          </TableHead>
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
            <SortableColumnHeader 
              label="Entry price" 
              sortKey="entryPrice" 
              onSort={onSort}
              className="ml-auto justify-end w-full" 
            />
          </TableHead>
          <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pr-4">
            <SortableColumnHeader 
              label="Liquidation" 
              sortKey="liquidation" 
              onSort={onSort}
              className="ml-auto justify-end w-full" 
            />
          </TableHead>
        </TableRow>
      </TableHeader>
    );
  }

  return (
    <TableHeader>
      <TableRow className="border-none bg-[#051728]">
        <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pl-4">
          <SortableColumnHeader 
            label="Name" 
            sortKey="coin" 
            onSort={onSort} 
          />
        </TableHead>
        <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
          <SortableColumnHeader 
            label="Size" 
            sortKey="total" 
            onSort={onSort}
            className="ml-auto justify-end w-full" 
          />
        </TableHead>
        <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
          <SortableColumnHeader 
            label="Price" 
            sortKey="price" 
            onSort={onSort}
            className="ml-auto justify-end w-full" 
          />
        </TableHead>
        <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
          <SortableColumnHeader 
            label="Change 24h" 
            sortKey="pnlPercentage" 
            onSort={onSort}
            className="ml-auto justify-end w-full" 
          />
        </TableHead>
        <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pr-4">
          <SortableColumnHeader 
            label="PNL" 
            sortKey="pnl" 
            onSort={onSort}
            className="ml-auto justify-end w-full" 
          />
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export function AssetsTable({ holdings, loading, type }: AssetsTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: type === 'spot' ? 'total' : null,
    direction: "desc",
  });
  const [isClient, setIsClient] = useState(false);
  
  // Effet pour marquer que nous sommes côté client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Récupérer les informations des marchés
  const { data: perpMarkets } = usePerpMarkets({ limit: 100 });
  const { data: spotMarketTokens } = useSpotTokens({ limit: 100 });
  
  // Convertir les holdings en format d'affichage (mémorisé)
  const displayHoldings = useMemo(() => {
    if (type === 'perp' && perpMarkets) {
      return (holdings as PerpHolding[]).map((holding) => {
        const marketInfo = perpMarkets.find((m: PerpMarketData) => m.name.toLowerCase() === holding.coin.toLowerCase());
        return {
          id: holding.coin,
          ...holding,
          logo: marketInfo?.logo,
          marginUsedValue: parseFloat(holding.marginUsed),
          positionValueNum: parseFloat(holding.positionValue),
          entryPriceNum: parseFloat(holding.entryPrice),
          liquidationNum: parseFloat(holding.liquidation),
        };
      });
    } else if (type === 'spot' && spotMarketTokens) {
      return (holdings as Holding[]).map((holding) => ({
        id: `${holding.coin}-${holding.token}`,
        ...holding,
        totalValue: parseFloat(holding.entryNtl),
        price: holding.price ? parseFloat(holding.price) : (parseFloat(holding.entryNtl) / parseFloat(holding.total)),
        entryPrice: parseFloat(holding.entryNtl),
        pnl: holding.pnl ? parseFloat(holding.pnl) : 0,
        pnlPercentage: holding.pnlPercentage ? parseFloat(holding.pnlPercentage) : 0,
      }));
    }
    return [];
  }, [holdings, type, perpMarkets, spotMarketTokens]);

  // Trier les données (fonction mémorisée)
  const sortData = useCallback((key: SortableKey) => {
    setSortConfig(prevConfig => {
      let direction: "asc" | "desc" = "asc";
      if (prevConfig.key === key && prevConfig.direction === "asc") {
        direction = "desc";
      }
      return { key, direction };
    });
  }, []);

  // Appliquer le tri (mémorisé)
  const sortedHoldings = useMemo(() => {
    if (!sortConfig.key) return displayHoldings;
    
    return [...displayHoldings].sort((a, b) => {
      if (type === 'perp') {
        const aValue = (a as PerpHoldingDisplay)[sortConfig.key as keyof PerpHoldingDisplay];
        const bValue = (b as PerpHoldingDisplay)[sortConfig.key as keyof PerpHoldingDisplay];
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }
      } else {
        const aValue = (a as HoldingDisplay)[sortConfig.key as keyof HoldingDisplay];
        const bValue = (b as HoldingDisplay)[sortConfig.key as keyof HoldingDisplay];
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }
      }
      
      return 0;
    });
  }, [displayHoldings, sortConfig, type]);

  // Formater les nombres (fonctions mémorisées)
  const formatCurrency = useCallback((value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numValue);
  }, []);

  const formatNumber = useCallback((value: string | number) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 4,
    }).format(numValue);
  }, []);

  const formatPercent = useCallback((value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(0)}%`;
  }, []);

  // Afficher un état de chargement initial côté serveur et client avant l'hydratation
  if (!isClient) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeaderComponent onSort={sortData} type={type} />
          <TableBody className="bg-[#051728CC]">
            <TableLoadingOrEmpty colSpan={4} isLoading={true} type={type} />
          </TableBody>
        </Table>
      </div>
    );
  }

  // Afficher l'état de chargement côté client
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeaderComponent onSort={sortData} type={type} />
          <TableBody className="bg-[#051728CC]">
            <TableLoadingOrEmpty colSpan={4} isLoading={true} type={type} />
          </TableBody>
        </Table>
      </div>
    );
  }

  // Afficher l'état vide côté client
  if (sortedHoldings.length === 0) {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeaderComponent onSort={sortData} type={type} />
          <TableBody className="bg-[#051728CC]">
            <TableLoadingOrEmpty colSpan={4} isLoading={false} isEmpty={true} type={type} />
          </TableBody>
        </Table>
      </div>
    );
  }

  // Afficher les données côté client
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeaderComponent onSort={sortData} type={type} />
        <TableBody className="bg-[#051728]">
          {sortedHoldings.map((holding) => {
            if (type === 'perp') {
              const perpHolding = holding as PerpHoldingDisplay;
              return (
                <TableRow
                  key={perpHolding.id}
                  className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors"
                >
                  <TableCell className="py-2 pl-4">
                    <div className="flex items-center gap-2">
                      {perpHolding.logo ? (
                        <img src={perpHolding.logo} alt={perpHolding.coin} className="w-5 h-5 rounded mr-2 object-contain" />
                      ) : (
                        <span className="w-5 h-5 bg-white rounded mr-2 inline-block" />
                      )}
                      <span className="text-white text-sm">{perpHolding.coin}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <span className={perpHolding.type === 'Short' ? 'text-[#FF4D4F]' : 'text-[#52C41A]'}>
                      {perpHolding.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-white text-sm py-2">
                    {formatCurrency(perpHolding.marginUsed)}
                  </TableCell>
                  <TableCell className="text-right text-white text-sm py-2">
                    {formatCurrency(perpHolding.positionValue)}
                  </TableCell>
                  <TableCell className="text-right text-white text-sm py-2">
                    {formatCurrency(perpHolding.entryPrice)}
                  </TableCell>
                  <TableCell className="text-right text-white text-sm py-2 pr-4">
                    {formatCurrency(perpHolding.liquidation)}
                  </TableCell>
                </TableRow>
              );
            } else {
              const spotHolding = holding as HoldingDisplay;
              return (
                <TableRow
                  key={spotHolding.id}
                  className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors"
                >
                  <TableCell className="py-2 pl-4">
                    <div className="flex items-center gap-2">
                      {spotHolding.logo ? (
                        <img src={spotHolding.logo} alt={spotHolding.coin} className="w-5 h-5 rounded mr-2 object-contain" />
                      ) : (
                        <span className="w-5 h-5 bg-white rounded mr-2 inline-block" />
                      )}
                      <span className="text-white text-sm">{spotHolding.coin}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-white text-sm py-2">
                    {formatNumber(spotHolding.total)}
                  </TableCell>
                  <TableCell className="text-right text-white text-sm py-2">
                    {formatCurrency(spotHolding.price)}
                  </TableCell>
                  <TableCell className="text-right text-sm py-2" style={{color: spotHolding.pnlPercentage < 0 ? '#FF4D4F' : '#52C41A'}}>
                    {formatPercent(spotHolding.pnlPercentage)}
                  </TableCell>
                  <TableCell className="text-right text-white text-sm py-2 pr-4">
                    {formatNumber(spotHolding.pnl)}
                  </TableCell>
                </TableRow>
              );
            }
          })}
        </TableBody>
      </Table>
    </div>
  );
} 