"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { formatNumber } from "@/lib/formatting";
import { useRouter } from "next/navigation";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useNumberFormat } from "@/store/number-format.store";
import { Pagination } from "@/components/ui/pagination";
import { TokenImage } from "../common/TokenImage";
import { LoadingState, ErrorState, EmptyState } from "../common/TableStates";
import { 
  SpotToken, 
  SpotSortableFields, 
  BaseTableProps, 
} from "../common/types";
import { getPriceChangeColor, formatPriceChange } from "@/components/ui/PriceChange";

interface TableHeadersProps {
  sortField: SpotSortableFields;
  onSort: (field: SpotSortableFields) => void;
}

function TableHeaders({ sortField, onSort }: TableHeadersProps) {
  return (
    <TableRow className="border-none bg-[#051728]">
      <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pl-4">
        <Button
          variant="ghost"
          className="text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center"
        >
          Name
        </Button>
      </TableHead>
      <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
        <Button
          variant="ghost"
          className="text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center ml-auto justify-end w-full"
        >
          Price
        </Button>
      </TableHead>
      <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
        <Button
          variant="ghost"
          onClick={() => onSort("change24h")}
          className={`${sortField === "change24h" ? "text-[#83E9FF]" : "text-[#FFFFFF99]"} font-normal hover:text-white p-0 flex items-center ml-auto justify-end w-full`}
        >
          Change
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
      <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
        <Button
          variant="ghost"
          onClick={() => onSort("marketCap")}
          className={`${sortField === "marketCap" ? "text-[#83E9FF]" : "text-[#FFFFFF99]"} font-normal hover:text-white p-0 flex items-center ml-auto justify-end w-full`}
        >
          Market Cap
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
      <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
        <Button
          variant="ghost"
          onClick={() => onSort("volume")}
          className={`${sortField === "volume" ? "text-[#83E9FF]" : "text-[#FFFFFF99]"} font-normal hover:text-white p-0 flex items-center ml-auto justify-end w-full`}
        >
          Volume
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </TableHead>
      <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pr-4">
        <Button
          variant="ghost"
          className="text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center ml-auto justify-end w-full"
        >
          Supply
        </Button>
      </TableHead>
    </TableRow>
  );
}

export function TokenTable({ loading: initialLoading = false }: BaseTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SpotSortableFields>("volume");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [pageSize, setPageSize] = useState(10);
  const { format } = useNumberFormat();
  
  const { 
    data: tokens, 
    isLoading, 
    error, 
    page, 
    totalPages,
    total,
    updateParams 
  } = useSpotTokens({
    limit: pageSize,
    defaultParams: {
      sortBy: sortField,
      sortOrder: sortOrder,
    }
  });

  const handleSort = (field: SpotSortableFields) => {
    if (sortField === field) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      updateParams({ 
        sortBy: field, 
        sortOrder: newOrder,
        page: 1
      });
    } else {
      setSortField(field);
      setSortOrder("desc");
      updateParams({ 
        sortBy: field, 
        sortOrder: "desc",
        page: 1
      });
    }
  };

  const handleTokenClick = (tokenName: string) => {
    router.push(`/market/${encodeURIComponent(tokenName)}`);
  };

  // Fonction pour vérifier si un champ est triable
  const isSortable = (field: string): boolean => {
    return ["volume", "marketCap", "change24h"].includes(field);
  };

  // Fonction pour obtenir la classe du bouton de tri
  const getSortButtonClass = (field: string): string => {
    const isActive = sortField === field;
    return `font-normal hover:text-white p-0 ml-auto transition-colors duration-200 ${
      !isSortable(field) ? 'cursor-default opacity-50' : ''
    } ${isActive ? 'text-[#83E9FF]' : 'text-[#FFFFFF99]'}`;
  };

  if (isLoading || initialLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message} />;
  }

  if (!tokens || tokens.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
      <Table>
        <TableHeader>
          <TableHeaders sortField={sortField} onSort={handleSort} />
        </TableHeader>
        <TableBody className="bg-[#051728]">
          {tokens.map((token: SpotToken) => (
            <TableRow
              key={token.name}
              className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors cursor-pointer"
              onClick={() => handleTokenClick(token.name)}
            >
              <TableCell className="py-2 pl-4">
                <div className="flex items-center gap-2">
                  <TokenImage src={token.logo} alt={token.name} />
                  <span className="text-white text-sm">{token.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right text-white text-sm py-2">
                ${formatNumber(token.price, format)}
              </TableCell>
              <TableCell className="text-right text-sm py-2">
                <span className={getPriceChangeColor(token.change24h)}>
                  {formatPriceChange(token.change24h)}
                </span>
              </TableCell>
              <TableCell className="text-right text-white text-sm py-2">
                ${formatNumber(token.marketCap, format)}
              </TableCell>
              <TableCell className="text-right text-white text-sm py-2">
                ${formatNumber(token.volume, format)}
              </TableCell>
              <TableCell className="text-right text-white text-sm py-2 pr-4">
                {formatNumber(token.supply, format)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="border-t border-[#FFFFFF1A] flex items-center">
        <div className="w-full px-4 py-3">
          <Pagination
            total={total}
            page={page - 1}
            rowsPerPage={pageSize}
            onPageChange={(newPage) => updateParams({ page: newPage + 1 })}
            onRowsPerPageChange={(newRowsPerPage) => {
              setPageSize(newRowsPerPage);
              updateParams({ 
                page: 1,
                limit: newRowsPerPage 
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
