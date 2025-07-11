import { memo, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { Loader2, Database, ArrowUpDown } from "lucide-react";
import { formatNumber, formatLargeNumber } from "@/lib/formatting";
import { formatPriceChange, TokenIcon } from "@/components/common";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,  
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PerpSortableFields } from "@/services/market/perp/types";
import { useNumberFormat } from "@/store/number-format.store";

// Composant pour l'en-tête de colonne
const TableHeaderCell = memo(({ label, onClick, className, isActive }: { 
  label: string; 
  onClick?: () => void; 
  className?: string; 
  isActive?: boolean; 
}) => (
  <TableHead className={`text-white text-sm py-1.5 bg-[#051728] ${className || ''}`.trim()}>
    <Button
      variant="ghost"
      onClick={onClick}
      className={`p-0 flex items-center justify-start w-full ${isActive ? 'text-[#f9e370] hover:text-[#f9e370]' : 'text-white hover:text-white'}`}
      style={{fontWeight: 400, fontSize: '0.875rem'}}
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
    <TableCell colSpan={4} className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg">Aucun token disponible</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">Vérifiez plus tard</p>
      </div>
    </TableCell>
  </TableRow>
));

EmptyState.displayName = 'EmptyState';

// Composant pour une ligne de token
const TokenRow = memo(({ token, format }: { token: any; format: any }) => (
  <TableRow className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors">
    <TableCell className="py-1.5 pl-4">
      <div className="flex items-center gap-1.5">
        <TokenIcon src={token.logo} name={token.name} size="sm" />
        <span className="text-white text-xs">{token.name}</span>
      </div>
    </TableCell>
    <TableCell className="text-left text-white text-xs py-1.5 pl-4">
      {formatNumber(token.price, format, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        currency: '$',
        showCurrency: true
      })}
    </TableCell>
    <TableCell className="text-left text-xs py-1.5 pl-4">
      <span style={{color: token.change24h < 0 ? '#FF4D4F' : '#52C41A'}}>
        {formatPriceChange(token.change24h)}
      </span>
    </TableCell>
    <TableCell className="text-left text-white text-xs py-1.5 pl-4 pr-4">
      {'$' + formatNumber(token.openInterest, format, { showCurrency: false, minimumFractionDigits: 0, maximumFractionDigits: 2 })}
    </TableCell>
  </TableRow>
));

TokenRow.displayName = 'TokenRow';

export const TrendingTokens = memo(function TrendingTokens() {
  const [sortField, setSortField] = useState<'change24h' | 'openInterest'>("change24h");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { format } = useNumberFormat();
  const { data: trendingTokens, isLoading, error, updateParams } = useTrendingPerpMarkets(5, sortField, sortOrder);
  const handleSort = useCallback((field: 'change24h' | 'openInterest') => {
    if (sortField === field) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      updateParams && updateParams({ sortBy: field, sortOrder: newOrder });
    } else {
      setSortField(field);
      setSortOrder("desc");
      updateParams && updateParams({ sortBy: field, sortOrder: "desc" });
    }
  }, [sortField, sortOrder, updateParams]);

  if (isLoading) {
    return (
      <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
        <div className="flex justify-center items-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
      </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
        <div className="flex justify-center items-center h-[400px]">
          <p className="text-red-500 text-sm">Une erreur est survenue</p>
      </div>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg h-full flex flex-col">
      {/* Tableau - flex-1 pour occuper l'espace restant */}
      <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHeaderCell
                label="Name"
                className="pl-4 text-left"
              />
              <TableHeaderCell
                label="Price"
                className="pl-4 text-left"
              />
              <TableHeaderCell
                label="24h"
                onClick={() => handleSort("change24h")}
                isActive={sortField === "change24h"}
                className="pl-4 text-left"
              />
              <TableHeaderCell
                label="Open Interest"
                onClick={() => handleSort("openInterest")}
                isActive={sortField === "openInterest"}
                className="pl-4 pr-4 text-left"
              />
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {trendingTokens && trendingTokens.length > 0 ? (
              trendingTokens.map((token) => (
                <TokenRow
                  key={token.name}
                  token={token}
                  format={format}
                />
              ))
            ) : (
              <EmptyState />
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}); 