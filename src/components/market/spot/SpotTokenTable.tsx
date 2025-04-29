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
import { ArrowUpDown, Database, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { useRouter } from "next/navigation";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import Image from "next/image";

// Types de tri supportés par l'API
type SortableFields = "volume" | "marketCap" | "change24h";

interface TokenTableProps {
  loading?: boolean;
}

export function TokenTable({ loading: initialLoading = false }: TokenTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortableFields>("volume");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  const { 
    data: tokens, 
    isLoading, 
    error, 
    page, 
    totalPages, 
    updateParams 
  } = useSpotTokens({
    defaultParams: {
      sortBy: sortField,
      sortOrder: sortOrder,
    }
  });

  const handleSort = (field: string) => {
    if (!["volume", "marketCap", "change24h"].includes(field)) {
      return;
    }

    const newField = field as SortableFields;
    if (sortField === newField) {
      const newOrder = sortOrder === "asc" ? "desc" : "asc";
      setSortOrder(newOrder);
      updateParams({ 
        sortBy: newField, 
        sortOrder: newOrder,
        page: 1
      });
    } else {
      setSortField(newField);
      setSortOrder("desc");
      updateParams({ 
        sortBy: newField, 
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
    return `text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto ${!isSortable(field) ? 'cursor-default opacity-50' : ''}`;
  };

  if (isLoading || initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="w-10 h-10 mb-4 text-[#83E9FF4D] animate-spin" />
        <p className="text-white text-lg">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg">Error loading data</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg">No data available</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">Check back later for updated market information</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
      <Table className="min-w-[650px]">
        <TableHeader>
          <TableRow className="border-none bg-[#051728]">
            <TableHead className="text-[#FFFFFF99] font-normal py-2 bg-transparent pl-4 w-[120px]">
              <Button
                variant="ghost"
                className={getSortButtonClass("name")}
                disabled={!isSortable("name")}
              >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-[#FFFFFF99] font-normal py-2 bg-transparent w-[100px]">
              <Button
                variant="ghost"
                className={getSortButtonClass("price")}
                disabled={!isSortable("price")}
              >
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent">
              <Button
                variant="ghost"
                onClick={() => handleSort("marketCap")}
                className={getSortButtonClass("marketCap")}
              >
                Market Cap
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent">
              <Button
                variant="ghost"
                onClick={() => handleSort("volume")}
                className={getSortButtonClass("volume")}
              >
                Volume
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent">
              <Button
                variant="ghost"
                className={getSortButtonClass("supply")}
                disabled={!isSortable("supply")}
              >
                Supply
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent pr-4">
              <Button
                variant="ghost"
                onClick={() => handleSort("change24h")}
                className={getSortButtonClass("change24h")}
              >
                Change
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-[#051728CC]">
          {tokens.map((token) => (
            <TableRow
              key={token.name}
              className="border-b border-[#FFFFFF1A] hover:bg-[#051728] cursor-pointer transition-colors"
              onClick={() => handleTokenClick(token.name)}
            >
              <TableCell className="py-4 pl-4">
                <div className="flex items-center gap-2">
                  {token.logo && (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={token.logo}
                        alt={token.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    </div>
                  )}
                  <span className="text-white text-sm md:text-base">{token.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right text-white text-sm md:text-base">
                ${formatNumber(token.price, "price")}
              </TableCell>
              <TableCell className="text-right text-white text-sm md:text-base">
                ${formatNumber(token.marketCap, "marketCap")}
              </TableCell>
              <TableCell className="text-right text-white text-sm md:text-base">
                ${formatNumber(token.volume, "volume")}
              </TableCell>
              <TableCell className="text-right text-white text-sm md:text-base">
                {formatNumber(token.supply, "supply")}
              </TableCell>
              <TableCell
                className={`text-right pr-4 text-sm md:text-base ${token.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {token.change24h >= 0 ? "+" : ""}
                {formatNumber(token.change24h, "change")}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-between items-center mt-4 px-4">
        <div className="text-[#FFFFFF99] text-sm">
          Page {page} sur {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: page - 1 })}
            disabled={page <= 1}
            className="border-[#FFFFFF1A] text-white hover:bg-[#051728]"
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: page + 1 })}
            disabled={page >= totalPages}
            className="border-[#FFFFFF1A] text-white hover:bg-[#051728]"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
