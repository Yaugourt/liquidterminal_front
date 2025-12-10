"use client";

import { useState, memo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowUpDown, Database, Loader2 } from "lucide-react";
import { formatNumber, formatMetricValue, formatPrice } from "@/lib/formatters/numberFormatting";
import { useRouter } from "next/navigation";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { useNumberFormat } from "@/store/number-format.store";
import { NumberFormatType } from "@/store/number-format.store";
import { Pagination, TokenIcon } from "@/components/common";
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
  searchQuery?: string;
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
      className={`${isActive ? "text-[#83E9FF]" : "text-zinc-400"} p-0 flex items-center justify-start gap-1 hover:text-white text-[10px] font-semibold uppercase tracking-wider`}
    >
      {label}
      {onClick && <ArrowUpDown className="h-3 w-3" />}
    </Button>
  </TableHead>
));

TableHeaderCell.displayName = 'TableHeaderCell';

// Composant pour l'état vide
const EmptyState = memo(() => (
  <TableRow>
    <TableCell colSpan={6} className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        <Database className="w-10 h-10 mb-3 text-zinc-600" />
        <p className="text-zinc-400 text-sm mb-1">Aucun token disponible</p>
        <p className="text-zinc-600 text-xs">Vérifiez plus tard</p>
      </div>
    </TableCell>
  </TableRow>
));

EmptyState.displayName = 'EmptyState';

// Composant pour une ligne de token spot
const SpotTokenRow = memo(({ token, onClick, format }: { token: SpotToken; onClick: () => void; format: NumberFormatType }) => (
  <TableRow
    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
    onClick={onClick}
  >
    <TableCell className="py-3 px-3">
      <div className="flex items-center gap-2">
        <TokenIcon src={token.logo} name={token.name} size="sm" />
        <span className="text-white text-sm font-medium">{token.name}</span>
      </div>
    </TableCell>
    <TableCell className="py-3 px-3 w-[10%]">
      <div className="text-white text-sm">
        {formatPrice(token.price, format)}
      </div>
    </TableCell>
    <TableCell className="py-3 px-3 w-[10%]">
      <StatusBadge variant={token.change24h < 0 ? 'error' : 'success'}>
        {token.change24h > 0 ? '+' : ''}{token.change24h}%
      </StatusBadge>
    </TableCell>
    <TableCell className="py-3 px-3 w-[12%]">
      <div className="text-white text-sm">
        ${formatNumber(token.volume, format)}
      </div>
    </TableCell>
    <TableCell className="py-3 px-3 w-[20%]">
      <div className="text-white text-sm">
        ${formatNumber(token.marketCap, format)}
      </div>
    </TableCell>
    <TableCell className="py-3 px-3 w-[12%]">
      <div className="text-white text-sm">
        {formatMetricValue(token.supply, { format: 'US', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </TableCell>
  </TableRow>
));

SpotTokenRow.displayName = 'SpotTokenRow';

// Composant pour une ligne de token perp
const PerpTokenRow = memo(({ token, onClick, format }: { token: PerpToken; onClick: () => void; format: NumberFormatType }) => {
  return (
    <TableRow
      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer"
      onClick={onClick}
    >
      <TableCell className="py-3 px-3 w-[17%]">
        <div className="flex items-center gap-2">
          <TokenIcon src={token.logo} name={token.name} size="sm" />
          <span className="text-white text-sm font-medium">{token.name}</span>
        </div>
      </TableCell>
      <TableCell className="py-3 px-3 w-[10%]">
        <div className="text-white text-sm">
          {formatPrice(token.price, format)}
        </div>
      </TableCell>
      <TableCell className="py-3 px-3 w-[10%]">
        <StatusBadge variant={token.change24h < 0 ? 'error' : 'success'}>
          {token.change24h > 0 ? '+' : ''}{token.change24h}%
        </StatusBadge>
      </TableCell>
      <TableCell className="py-3 px-3 w-[20%]">
        <div className="text-white text-sm">
          ${formatNumber(token.volume, format)}
        </div>
      </TableCell>
      <TableCell className="py-3 px-3 w-[20%]">
        <div className="text-white text-sm">
          ${formatNumber(token.openInterest, format)}
        </div>
      </TableCell>
      <TableCell className="py-3 px-3 w-[11%]">
        <StatusBadge variant={token.funding >= 0 ? 'success' : 'error'}>
          {token.funding > 0 ? '+' : ''}{token.funding}%
        </StatusBadge>
      </TableCell>
    </TableRow>
  );
});

PerpTokenRow.displayName = 'PerpTokenRow';

export function TokenTable({ market, strict = false, searchQuery = '' }: TokenTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SpotSortableFields | PerpSortableFields>(
    market === 'spot' ? "volume" : "volume"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const { format } = useNumberFormat();

  // Récupérer tous les tokens pour la recherche
  const { data: allSpotTokens } = useSpotTokens({ limit: 1000, strict });
  const { data: allPerpMarkets } = usePerpMarkets({ limit: 1000 });

  // Récupérer les tokens paginés pour l'affichage
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
  const allTokens = market === 'spot' ? allSpotTokens : allPerpMarkets;
  const total = market === 'spot' ? spotResult.total : perpResult.total;
  const isLoading = market === 'spot' ? spotResult.isLoading : perpResult.isLoading;
  const currentPage = market === 'spot' ? page : perpResult.page;

  // Dédupliquer tous les tokens basé sur la clé unique
  const uniqueAllTokens = allTokens?.filter((token, index, self) => {
    const key = market === 'spot'
      ? `${market}-${token.name}-${(token as SpotTokenService).tokenId}`
      : `${market}-${token.name}-${(token as PerpMarketData).index}`;

    return self.findIndex(t => {
      const tKey = market === 'spot'
        ? `${market}-${t.name}-${(t as SpotTokenService).tokenId}`
        : `${market}-${t.name}-${(t as PerpMarketData).index}`;
      return tKey === key;
    }) === index;
  }) || [];

  // Filtrer tous les tokens par recherche
  const filteredTokens = uniqueAllTokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Si il y a une recherche, utiliser les tokens filtrés, sinon utiliser les tokens paginés
  const tokens = searchQuery ? filteredTokens : rawTokens;



  const handlePageChange = (newPage: number) => {
    if (market === 'spot') {
      setPage(newPage + 1);
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
      <div className="w-full bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl shadow-black/20 overflow-hidden">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF]" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#151A25]/60 backdrop-blur-md border border-white/5 rounded-2xl hover:border-white/10 transition-all shadow-xl shadow-black/20 overflow-hidden">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHeaderCell
                label="Name"
                className={`py-3 px-3 ${market === 'spot' ? 'w-[16.66%]' : 'w-[17%]'}`}
              />
              <TableHeaderCell
                label="Price"
                onClick={market === 'perp' ? () => handleSort("price") : undefined}
                isActive={market === 'perp' && sortField === "price"}
                className={`py-3 px-3 ${market === 'spot' ? 'w-[10%]' : 'w-[10%]'}`}
              />
              <TableHeaderCell
                label="24h"
                onClick={() => handleSort("change24h")}
                isActive={sortField === "change24h"}
                className={`py-3 px-3 ${market === 'spot' ? 'w-[10%]' : 'w-[10%]'}`}
              />
              <TableHeaderCell
                label="Volume"
                onClick={() => handleSort("volume")}
                isActive={sortField === "volume"}
                className={`py-3 px-3 ${market === 'spot' ? 'w-[12%]' : 'w-[20%]'}`}
              />

              {/* Colonnes conditionnelles selon le marché */}
              {market === 'spot' ? (
                <>
                  <TableHeaderCell
                    label="Market Cap"
                    onClick={() => handleSort("marketCap")}
                    isActive={sortField === "marketCap"}
                    className="py-3 px-3 w-[20%]"
                  />
                  <TableHeaderCell
                    label="Supply"
                    className="py-3 px-3 w-[12%]"
                  />
                </>
              ) : (
                <>
                  <TableHeaderCell
                    label="Open Interest"
                    onClick={() => handleSort("openInterest")}
                    isActive={sortField === "openInterest"}
                    className="py-3 px-3 w-[20%]"
                  />
                  <TableHeaderCell
                    label="Funding Rate"
                    className="py-3 px-3 w-[11%]"
                  />
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens && tokens.length > 0 ? (
              tokens.map((token, index) => (
                market === 'spot' ? (
                  <SpotTokenRow
                    key={`${market}-${token.name}-${(token as SpotTokenService).tokenId}-${index}`}
                    token={token as SpotToken}
                    onClick={() => handleTokenClick(token.name)}
                    format={format}
                  />
                ) : (
                  <PerpTokenRow
                    key={`${market}-${token.name}-${(token as PerpMarketData).index}-${index}`}
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
      <div className="border-t border-white/5 px-4 py-3">
        <Pagination
          total={total}
          page={currentPage - 1}
          rowsPerPage={pageSize}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 15, 20]}
        />
      </div>
    </div>
  );
} 