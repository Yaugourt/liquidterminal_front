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
import { ArrowUpDown, Database, Loader2, TrendingUp, CreditCard, BarChart2, Package } from "lucide-react";
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
    const isActive = sortField === field;
    return `font-normal hover:text-white p-0 ml-auto transition-colors duration-200 ${
      !isSortable(field) ? 'cursor-default opacity-50' : ''
    } ${isActive ? 'text-[#83E9FF]' : 'text-[#FFFFFF99]'}`;
  };

  // Fonction pour obtenir l'icône appropriée pour chaque colonne
  const getColumnIcon = (field: string) => {
    switch (field) {
      case "marketCap":
        return <CreditCard className="mr-1.5 h-3.5 w-3.5 opacity-70" />;
      case "volume":
        return <BarChart2 className="mr-1.5 h-3.5 w-3.5 opacity-70" />;
      case "supply":
        return <Package className="mr-1.5 h-3.5 w-3.5 opacity-70" />;
      case "change24h":
        return <TrendingUp className="mr-1.5 h-3.5 w-3.5 opacity-70" />;
      default:
        return null;
    }
  };

  if (isLoading || initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="w-10 h-10 mb-4 text-[#83E9FF4D] animate-spin" />
        <p className="text-white text-lg font-serif">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg font-serif">Error loading data</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">{error.message}</p>
      </div>
    );
  }

  if (!tokens || tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg font-serif">No data available</p>
        <p className="text-[#FFFFFF80] text-sm mt-2">Check back later for updated market information</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent rounded-xl">
      <Table className="min-w-[650px]">
        <TableHeader>
          <TableRow className="border-none bg-transparent">
            <TableHead className="text-xs uppercase tracking-wide font-medium py-4 bg-transparent pl-6 w-[120px]">
              <Button
                variant="ghost"
                className={getSortButtonClass("name")}
                disabled={!isSortable("name")}
              >
                Name
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-60" />
              </Button>
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide font-medium py-4 bg-transparent w-[100px]">
              <Button
                variant="ghost"
                className={getSortButtonClass("price")}
                disabled={!isSortable("price")}
              >
                Price
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-60" />
              </Button>
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide font-medium py-4 bg-transparent">
              <Button
                variant="ghost"
                onClick={() => handleSort("marketCap")}
                className={getSortButtonClass("marketCap")}
              >
                <div className="flex items-center">
                  {getColumnIcon("marketCap")}
                  Market Cap
                </div>
                <ArrowUpDown className={`ml-2 h-3.5 w-3.5 transition-opacity ${sortField === 'marketCap' ? 'opacity-100' : 'opacity-60'}`} />
              </Button>
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide font-medium py-4 bg-transparent">
              <Button
                variant="ghost"
                onClick={() => handleSort("volume")}
                className={getSortButtonClass("volume")}
              >
                <div className="flex items-center">
                  {getColumnIcon("volume")}
                  Volume
                </div>
                <ArrowUpDown className={`ml-2 h-3.5 w-3.5 transition-opacity ${sortField === 'volume' ? 'opacity-100' : 'opacity-60'}`} />
              </Button>
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide font-medium py-4 bg-transparent">
              <Button
                variant="ghost"
                className={getSortButtonClass("supply")}
                disabled={!isSortable("supply")}
              >
                <div className="flex items-center">
                  {getColumnIcon("supply")}
                  Supply
                </div>
                <ArrowUpDown className="ml-2 h-3.5 w-3.5 opacity-60" />
              </Button>
            </TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide font-medium py-4 bg-transparent pr-6">
              <Button
                variant="ghost"
                onClick={() => handleSort("change24h")}
                className={getSortButtonClass("change24h")}
              >
                <div className="flex items-center">
                  {getColumnIcon("change24h")}
                  Change
                </div>
                <ArrowUpDown className={`ml-2 h-3.5 w-3.5 transition-opacity ${sortField === 'change24h' ? 'opacity-100' : 'opacity-60'}`} />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-transparent">
          {tokens.map((token) => (
            <TableRow
              key={token.name}
              className="border-b border-[#FFFFFF0A] hover:bg-[#83E9FF0A] cursor-pointer transition-all"
              onClick={() => handleTokenClick(token.name)}
            >
              <TableCell className="py-4 pl-6">
                <div className="flex items-center gap-3">
                  {token.logo ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#83E9FF33] shadow-[0_0_8px_rgba(131,233,255,0.15)] backdrop-blur-sm">
                      <Image
                        src={token.logo}
                        alt={token.name}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#051728] border border-[#83E9FF33] flex items-center justify-center shadow-[0_0_8px_rgba(131,233,255,0.08)]">
                      <span className="text-[#83E9FF] text-xs font-medium">{token.name.charAt(0)}</span>
                    </div>
                  )}
                  <span className="text-white text-sm md:text-base font-medium">{token.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right text-white text-sm md:text-base font-medium">
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
                className={`text-right pr-6 text-sm md:text-base font-medium ${token.change24h >= 0 ? "text-[#4ADE80]" : "text-[#F87171]"}`}
              >
                {token.change24h >= 0 ? "+" : ""}
                {formatNumber(token.change24h, "change")}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-between items-center mt-5 px-6 pb-4 pt-4 border-t border-[#FFFFFF0A]">
        <div className="text-[#FFFFFF80] text-xs">
          Page {page} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: page - 1 })}
            disabled={page <= 1}
            className="border-[#83E9FF33] text-white bg-[#FFFFFF08] hover:bg-[#83E9FF15] hover:border-[#83E9FF66] transition-all rounded-md px-4 py-1.5 h-auto text-xs"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: page + 1 })}
            disabled={page >= totalPages}
            className="border-[#83E9FF33] text-white bg-[#FFFFFF08] hover:bg-[#83E9FF15] hover:border-[#83E9FF66] transition-all rounded-md px-4 py-1.5 h-auto text-xs"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
