"use client";

import { useState, memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Database, Loader2 } from "lucide-react";
import { formatNumber, formatMetricValue, formatPrice } from "@/lib/formatters/numberFormatting";
import { useRouter } from "next/navigation";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { useNumberFormat } from "@/store/number-format.store";
import { NumberFormatType } from "@/store/number-format.store";
import { Pagination, TokenIcon, formatPriceChange } from "@/components/common";
import { 
  SpotToken, 
  PerpToken,
  SpotSortableFields, 
  BaseTableProps, 
} from "./types";
import { PerpSortableFields, PerpMarketData } from "@/services/market/perp/types";
import { SpotToken as SpotTokenService } from "@/services/market/spot/types";

interface TokenTableProps extends BaseTableProps {
  market: 'spot' | 'perp';
  strict?: boolean; // Only for spot market
}

interface TableHeaderCellProps {
  label: string;
  onClick?: () => void;
  className?: string;
  isActive?: boolean;
}

// Composant pour l'en-tête de colonne
const TableHeaderCell = memo(({ label, onClick, className, isActive }: TableHeaderCellProps) => (
  <TableHead className={className}>
    <Button
      variant="ghost"
      onClick={onClick}
      className={`${isActive ? "text-[#f9e370] hover:text-[#f9e370]" : "text-white hover:text-white"} font-normal p-0 flex items-center justify-start w-full`}
    >
      {label}
      {onClick && <ArrowUpDown className="ml-2 h-4 w-4" />}
    </Button>
  </TableHead>
));

TableHeaderCell.displayName = 'TableHeaderCell';

// Composant pour l'état vide
const EmptyState = memo(() => (
  <TableRow>
    <TableCell colSpan={6} className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg">Aucun token disponible</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">Vérifiez plus tard</p>
      </div>
    </TableCell>
  </TableRow>
));

EmptyState.displayName = 'EmptyState';

// Composant pour une ligne de token spot
const SpotTokenRow = memo(({ token, onClick, format }: { token: SpotToken; onClick: () => void; format: NumberFormatType }) => (
  <TableRow
    className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors cursor-pointer"
    onClick={onClick}
  >
    <TableCell className="py-4 pl-4">
      <div className="flex items-center gap-2">
        <TokenIcon src={token.logo} name={token.name} size="sm" />
        <span className="text-white text-sm">{token.name}</span>
      </div>
    </TableCell>
    <TableCell className="py-4 pl-0 w-[10%]">
      <div className="text-white text-sm">
        {formatPrice(token.price, format)}
      </div>
    </TableCell>
    <TableCell className="py-4 pl-4 pr-10 w-[10%]">
      <div className="text-sm" style={{color: token.change24h < 0 ? '#FF4D4F' : '#52C41A'}}>
        {formatPriceChange(token.change24h)}
      </div>
    </TableCell>
    <TableCell className="py-4 pl-0 pr-2 w-[12%]">
      <div className="text-white text-sm">
        ${formatNumber(token.volume, format)}
      </div>
    </TableCell>
    <TableCell className="py-4 pl-10 pr-10 w-[20%]">
      <div className="text-white text-sm">
        ${formatNumber(token.marketCap, format)}
      </div>
    </TableCell>
    <TableCell className="py-4 pl-0 w-[12%]">
      <div className="text-white text-sm">
        {formatMetricValue(token.supply, { format: 'US', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </TableCell>
  </TableRow>
));

SpotTokenRow.displayName = 'SpotTokenRow';

// Composant pour une ligne de token perp
const PerpTokenRow = memo(({ token, onClick, format }: { token: PerpToken; onClick: () => void; format: NumberFormatType }) => {
  const formatFunding = (funding: number) => {
    const percentage = funding * 100;
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(4)}%`;
  };

  return (
    <TableRow
      className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors cursor-pointer"
      onClick={onClick}
    >
      <TableCell className="py-4 pl-4 w-[17%]">
        <div className="flex items-center gap-2">
          <TokenIcon src={token.logo} name={token.name} size="sm" />
          <span className="text-white text-sm">{token.name}</span>
        </div>
      </TableCell>
      <TableCell className="py-4 pl-0 pr-8 w-[10%]">
        <div className="text-white text-sm">
          {formatPrice(token.price, format)}
        </div>
      </TableCell>
      <TableCell className="py-4 pl-4 pr-20 w-[10%]">
        <div className="text-sm" style={{color: token.change24h < 0 ? '#FF4D4F' : '#52C41A'}}>
          {formatPriceChange(token.change24h)}
        </div>
      </TableCell>
      <TableCell className="py-4 pl-0 w-[20%]">
        <div className="text-white text-sm">
          ${formatNumber(token.volume, format)}
        </div>
      </TableCell>
      <TableCell className="py-4 pl-4 pr-12 w-[20%]">
        <div className="text-white text-sm">
          ${formatNumber(token.openInterest, format)}
        </div>
      </TableCell>
      <TableCell className="py-4 pr-0 w-[11%]">
        <div className="text-sm" style={{color: token.funding >= 0 ? '#52C41A' : '#FF4D4F'}}>
          {formatFunding(token.funding)}
        </div>
      </TableCell>
    </TableRow>
  );
});

PerpTokenRow.displayName = 'PerpTokenRow';

export function TokenTable({ market, strict = false }: TokenTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SpotSortableFields | PerpSortableFields>(
    market === 'spot' ? "volume" : "volume"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const { format } = useNumberFormat();

  // Toujours appeler les hooks, mais ignorer les résultats non pertinents
  const spotResult = useSpotTokens({
    limit: pageSize,
    page,
    sortBy: sortField as SpotSortableFields,
    sortOrder,
    strict
  });

  const perpResult = usePerpMarkets({
    limit: pageSize,
    defaultParams: {
      sortBy: sortField as PerpSortableFields,
      sortOrder: sortOrder,
    }
  });

  // Sélectionner les bonnes données selon le marché
  const rawTokens = market === 'spot' ? spotResult.data : perpResult.data;
  const total = market === 'spot' ? spotResult.total : perpResult.total;
  const isLoading = market === 'spot' ? spotResult.isLoading : perpResult.isLoading;
  const currentPage = market === 'spot' ? page : perpResult.page;

  // Dédupliquer les tokens basé sur la clé unique
  const tokens = rawTokens.filter((token, index, self) => {
    const key = market === 'spot' 
      ? `${market}-${token.name}-${(token as SpotTokenService).tokenId}`
      : `${market}-${token.name}-${(token as PerpMarketData).index}`;
    
    return self.findIndex(t => {
      const tKey = market === 'spot' 
        ? `${market}-${t.name}-${(t as SpotTokenService).tokenId}`
        : `${market}-${t.name}-${(t as PerpMarketData).index}`;
      return tKey === key;
    }) === index;
  });



  const handlePageChange = (newPage: number) => {
    if (market === 'spot') {
      setPage(newPage + 1);
    } else if (perpResult.updateParams) {
      perpResult.updateParams({ page: newPage + 1 });
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setPageSize(newRowsPerPage);
    if (market === 'spot') {
      setPage(1);
    } else if (perpResult.updateParams) {
      perpResult.updateParams({ 
        page: 1,
        limit: newRowsPerPage 
      });
    }
  };

  const handleSort = useCallback((field: SpotSortableFields | PerpSortableFields) => {
    if (market === 'spot') {
      if (sortField === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        setPage(1);
      } else {
        setSortField(field);
        setSortOrder("desc");
        setPage(1);
      }
    } else if (perpResult.updateParams) {
      if (sortField === field) {
        const newOrder = sortOrder === "asc" ? "desc" : "asc";
        setSortOrder(newOrder);
        perpResult.updateParams({ 
          sortBy: field as PerpSortableFields, 
          sortOrder: newOrder,
          page: 1
        });
      } else {
        setSortField(field);
        setSortOrder("desc");
        perpResult.updateParams({ 
          sortBy: field as PerpSortableFields, 
          sortOrder: "desc",
          page: 1
        });
      }
    }
  }, [market, sortField, sortOrder, perpResult]);

  const handleTokenClick = useCallback((tokenName: string) => {
    const basePath = market === 'spot' ? '/market/spot' : '/market/perp';
    router.push(`${basePath}/${encodeURIComponent(tokenName)}`);
  }, [router, market]);

  if (isLoading && !tokens.length) {
    return (
      <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHeaderCell
                label="Name"
                className={`text-white font-normal py-1 bg-[#051728] pl-4 ${market === 'spot' ? 'w-[16.66%]' : 'w-[17%]'}`}
              />
              <TableHeaderCell
                label="Price"
                onClick={market === 'perp' ? () => handleSort("price") : undefined}
                isActive={market === 'perp' && sortField === "price"}
                className={`text-white font-normal py-1 bg-[#051728] ${market === 'spot' ? 'pl-0 w-[10%]' : 'pl-0 pr-8 w-[10%]'}`}
              />
              <TableHeaderCell
                label="24h"
                onClick={() => handleSort("change24h")}
                isActive={sortField === "change24h"}
                className={`text-white font-normal py-1 bg-[#051728] ${market === 'spot' ? 'pl-4 pr-10 w-[10%]' : 'pl-4 pr-20 w-[10%]'}`}
              />
              <TableHeaderCell
                label="Volume"
                onClick={() => handleSort("volume")}
                isActive={sortField === "volume"}
                className={`text-white font-normal py-1 bg-[#051728] ${market === 'spot' ? 'pl-0 pr-2 w-[12%]' : 'pl-0 w-[20%]'}`}
              />
              
              {/* Colonnes conditionnelles selon le marché */}
              {market === 'spot' ? (
                <>
                  <TableHeaderCell
                    label="Market Cap"
                    onClick={() => handleSort("marketCap")}
                    isActive={sortField === "marketCap"}
                    className="text-white font-normal py-1 bg-[#051728] pl-10 pr-10 w-[20%]"
                  />
                  <TableHeaderCell
                    label="Supply"
                    className="text-white font-normal py-1 bg-[#051728] pl-0 w-[12%]"
                  />
                </>
              ) : (
                <>
                  <TableHeaderCell
                    label="Open Interest"
                    onClick={() => handleSort("openInterest")}
                    isActive={sortField === "openInterest"}
                    className="text-white font-normal py-1 bg-[#051728] pl-4 pr-12 w-[20%]"
                  />
                  <TableHeaderCell
                    label="Funding Rate"
                    className="text-white font-normal py-1 bg-[#051728] pr-0 w-[11%]"
                  />
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {tokens && tokens.length > 0 ? (
              tokens.map((token) => (
                market === 'spot' ? (
                  <SpotTokenRow
                    key={`${market}-${token.name}-${(token as SpotTokenService).tokenId}`}
                    token={token as SpotToken}
                    onClick={() => handleTokenClick(token.name)}
                    format={format}
                  />
                ) : (
                  <PerpTokenRow
                    key={`${market}-${token.name}-${(token as PerpMarketData).index}`}
                    token={token as PerpToken}
                    onClick={() => handleTokenClick(token.name)}
                    format={format}
                  />
                )
              ))
            ) : (
              <EmptyState />
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination intégrée */}
      <div className="border-t border-[#FFFFFF1A] px-4 py-3 bg-[#051728]">
        <Pagination
          total={total}
          page={currentPage - 1}
          rowsPerPage={pageSize}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 15, 20]}
        />
      </div>
    </Card>
  );
} 