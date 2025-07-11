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
import { formatNumber, formatMetricValue } from "@/lib/formatting";
import { useRouter } from "next/navigation";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useNumberFormat, NUMBER_FORMATS } from "@/store/number-format.store";
import { Pagination, TokenIcon, formatPriceChange } from "@/components/common";
import { 
  SpotToken, 
  SpotSortableFields, 
  BaseTableProps, 
} from "../common/types";


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

// Composant pour une ligne de token
const TokenRow = memo(({ token, onClick, format }: { token: SpotToken; onClick: () => void; format: any }) => (
  <TableRow
    className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors cursor-pointer"
    onClick={onClick}
  >
    <TableCell className="py-2 pl-4">
      <div className="flex items-center gap-2">
        <TokenIcon src={token.logo} name={token.name} size="sm" />
        <span className="text-white text-sm">{token.name}</span>
      </div>
    </TableCell>
    <TableCell className="py-2 pl-0 w-[10%]">
      <div className="text-white text-sm">
        ${formatNumber(token.price, format)}
      </div>
    </TableCell>
    <TableCell className="py-2 pl-4 pr-10 w-[10%]">
      <div className="text-sm" style={{color: token.change24h < 0 ? '#FF4D4F' : '#52C41A'}}>
        {formatPriceChange(token.change24h)}
      </div>
    </TableCell>
    <TableCell className="py-2 pl-0 pr-2 w-[12%]">
      <div className="text-white text-sm">
        ${formatNumber(token.volume, format)}
      </div>
    </TableCell>
    <TableCell className="py-2 pl-10 pr-10 w-[20%]">
      <div className="text-white text-sm">
        ${formatNumber(token.marketCap, format)}
      </div>
    </TableCell>
    <TableCell className="py-2 pl-0 w-[12%]">
      <div className="text-white text-sm">
        {formatMetricValue(token.supply, { format: 'US', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </div>
    </TableCell>
    </TableRow>
));

TokenRow.displayName = 'TokenRow';

export function TokenTable({ loading: initialLoading = false, strict = false }: BaseTableProps & { strict?: boolean }) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SpotSortableFields>("volume");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const { format } = useNumberFormat();
  
  const { 
    data: tokens, 
    total,
    isLoading
  } = useSpotTokens({
    limit: pageSize,
    page,
    sortBy: sortField,
    sortOrder,
    strict
  });

  const handlePageChange = (newPage: number) => setPage(newPage + 1);
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setPage(1);
    setPageSize(newRowsPerPage);
  };

  const handleSort = useCallback((field: SpotSortableFields) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      setPage(1);
    } else {
      setSortField(field);
      setSortOrder("desc");
      setPage(1);
    }
  }, [sortField, sortOrder]);

  const handleTokenClick = useCallback((tokenName: string) => {
    router.push(`/market/spot/${encodeURIComponent(tokenName)}`);
  }, [router]);

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
                className="text-white font-normal py-1 bg-[#051728] pl-4 w-[16.66%]"
              />
              <TableHeaderCell
                label="Price"
                className="text-white font-normal py-1 bg-[#051728] pl-0 w-[10%]"
              />
              <TableHeaderCell
                label="24h"
                onClick={() => handleSort("change24h")}
                isActive={sortField === "change24h"}
                className="text-white font-normal py-1 bg-[#051728] pl-4 pr-10 w-[10%]"
              />
              <TableHeaderCell
                label="Volume"
                onClick={() => handleSort("volume")}
                isActive={sortField === "volume"}
                className="text-white font-normal py-1 bg-[#051728] pl-0 pr-2 w-[12%]"
              />
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
            </TableRow>
        </TableHeader>
        <TableBody className="bg-[#051728]">
            {tokens && tokens.length > 0 ? (
              tokens.map((token) => (
                <TokenRow
              key={token.name}
                  token={token}
              onClick={() => handleTokenClick(token.name)}
                  format={format}
                />
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
            page={page - 1}
            rowsPerPage={pageSize}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 15, 20]}
          />
      </div>
    </Card>
  );
}
