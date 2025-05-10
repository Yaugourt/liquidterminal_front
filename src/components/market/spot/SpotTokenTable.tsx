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
    return `text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto ${
      !isSortable(field) ? 'cursor-default opacity-50' : ''
    } ${isActive ? 'text-[#83E9FF]' : ''}`;
  };

  // Fonction pour obtenir l'icône appropriée pour chaque colonne
  const getColumnIcon = (field: string) => {
    switch (field) {
      case "marketCap":
        return <CreditCard className="mr-1.5 h-3.5 w-3.5" />;
      case "volume":
        return <BarChart2 className="mr-1.5 h-3.5 w-3.5" />;
      case "supply":
        return <Package className="mr-1.5 h-3.5 w-3.5" />;
      case "change24h":
        return <TrendingUp className="mr-1.5 h-3.5 w-3.5" />;
      default:
        return null;
    }
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
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full rounded-xl">
      <Table className="min-w-[650px]">
        <TableHeader>
          <TableRow className="border-none bg-[#051728]">
            <TableHead className="text-[#FFFFFF99] font-medium py-3 bg-transparent pl-4 w-[120px]">
              <Button
                variant="ghost"
                className={getSortButtonClass("name")}
                disabled={!isSortable("name")}
              >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
              </Button>
            </TableHead>
            <TableHead className="text-[#FFFFFF99] font-medium py-3 bg-transparent w-[100px]">
              <Button
                variant="ghost"
                className={getSortButtonClass("price")}
                disabled={!isSortable("price")}
              >
                Price
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
              </Button>
            </TableHead>
            <TableHead className="text-right text-[#FFFFFF99] font-medium py-3 bg-transparent">
              <Button
                variant="ghost"
                onClick={() => handleSort("marketCap")}
                className={getSortButtonClass("marketCap")}
              >
                <div className="flex items-center">
                  {getColumnIcon("marketCap")}
                  Market Cap
                </div>
                <ArrowUpDown className={`ml-2 h-4 w-4 ${sortField === 'marketCap' ? 'opacity-100' : 'opacity-60'}`} />
              </Button>
            </TableHead>
            <TableHead className="text-right text-[#FFFFFF99] font-medium py-3 bg-transparent">
              <Button
                variant="ghost"
                onClick={() => handleSort("volume")}
                className={getSortButtonClass("volume")}
              >
                <div className="flex items-center">
                  {getColumnIcon("volume")}
                  Volume
                </div>
                <ArrowUpDown className={`ml-2 h-4 w-4 ${sortField === 'volume' ? 'opacity-100' : 'opacity-60'}`} />
              </Button>
            </TableHead>
            <TableHead className="text-right text-[#FFFFFF99] font-medium py-3 bg-transparent">
              <Button
                variant="ghost"
                className={getSortButtonClass("supply")}
                disabled={!isSortable("supply")}
              >
                <div className="flex items-center">
                  {getColumnIcon("supply")}
                  Supply
                </div>
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-60" />
              </Button>
            </TableHead>
            <TableHead className="text-right text-[#FFFFFF99] font-medium py-3 bg-transparent pr-4">
              <Button
                variant="ghost"
                onClick={() => handleSort("change24h")}
                className={getSortButtonClass("change24h")}
              >
                <div className="flex items-center">
                  {getColumnIcon("change24h")}
                  Change
                </div>
                <ArrowUpDown className={`ml-2 h-4 w-4 ${sortField === 'change24h' ? 'opacity-100' : 'opacity-60'}`} />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-[#051728]/80 backdrop-blur-sm">
          {tokens.map((token) => (
            <TableRow
              key={token.name}
              className="border-b border-[#FFFFFF1A] hover:bg-[#83E9FF0A] cursor-pointer transition-colors"
              onClick={() => handleTokenClick(token.name)}
            >
              <TableCell className="py-4 pl-4">
                <div className="flex items-center gap-2">
                  {token.logo ? (
                    <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#83E9FF33] shadow-[0_0_8px_rgba(131,233,255,0.15)]">
                      <Image
                        src={token.logo}
                        alt={token.name}
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#051728] border border-[#83E9FF33] flex items-center justify-center">
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
                className={`text-right pr-4 text-sm md:text-base font-medium ${token.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
              >
                {token.change24h >= 0 ? "+" : ""}
                {formatNumber(token.change24h, "change")}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="flex justify-between items-center mt-4 px-4 pb-2">
        <div className="text-[#FFFFFF99] text-sm">
          Page {page} sur {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: page - 1 })}
            disabled={page <= 1}
            className="border-[#83E9FF33] text-white hover:bg-[#83E9FF0A] hover:border-[#83E9FF66] transition-colors rounded-lg"
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updateParams({ page: page + 1 })}
            disabled={page >= totalPages}
            className="border-[#83E9FF33] text-white hover:bg-[#83E9FF0A] hover:border-[#83E9FF66] transition-colors rounded-lg"
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
