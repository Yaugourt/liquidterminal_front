import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,  
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { Loader2, ArrowUpDown, ArrowRight } from "lucide-react";
import { TrendingTokensProps } from "@/components/types/dashboard.types";
import { useState } from "react";
import { PerpMarketData, PerpSortableFields } from "@/services/market/perp/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber, formatLargeNumber } from "@/lib/formatting";
import Image from "next/image";
import { Database } from "lucide-react";
import { useFeesStats } from "@/services/market/fees/hooks/useFeesStats";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";

type SpotSortType = "marketcap" | "volume" | "change24h" | "price" | "name";
type SortType = SpotSortType | PerpSortableFields;
type SortOrder = "asc" | "desc";

// Fonction de garde de type pour vérifier si un champ est un PerpSortableField
const isPerpSortableField = (field: SortType): field is PerpSortableFields => {
  const perpFields: PerpSortableFields[] = ["volume", "openInterest", "change24h", "price", "name"];
  return perpFields.includes(field as PerpSortableFields);
};

// Composant d'image avec gestion d'erreur
function TokenImage({ src, alt }: { src: string; alt: string }) {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className="w-6 h-6 rounded-full bg-[#051728] border border-[#83E9FF33] flex items-center justify-center shadow-[0_0_8px_rgba(131,233,255,0.08)]">
                <span className="text-[#83E9FF] text-xs font-medium">{alt.charAt(0)}</span>
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={24}
            height={24}
            className="w-6 h-6 rounded-full border border-[#83E9FF33] shadow-[0_0_8px_rgba(131,233,255,0.15)] backdrop-blur-sm"
            onError={() => setHasError(true)}
            unoptimized // Pour les images externes
        />
    );
}

export function TrendingTokens({ type, title }: TrendingTokensProps) {
  const defaultSort = type === "spot" ? "volume" : "volume";
  const [sortBy, setSortBy] = useState<SortType>(defaultSort);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const { format } = useNumberFormat();
  
  const {
    data: spotTokens,
    isLoading: isLoadingSpot,
    error: errorSpot,
    updateParams: updateSpotParams,
    totalVolume: spotTotalVolume
  } = useTrendingSpotTokens();

  const {
    data: perpTokens,
    isLoading: isLoadingPerp,
    error: errorPerp,
    updateParams: updatePerpParams,
    totalVolume: perpTotalVolume
  } = useTrendingPerpMarkets();

  const { feesStats } = useFeesStats();
  const { stats: perpStats } = usePerpGlobalStats();

  const tokens = type === "spot" ? spotTokens : perpTokens;
  const isLoading = type === "spot" ? isLoadingSpot : isLoadingPerp;
  const error = type === "spot" ? errorSpot : errorPerp;
  const totalVolume = type === "spot" ? spotTotalVolume : perpTotalVolume;
  const updateParams = type === "spot" ? updateSpotParams : updatePerpParams;
  
  // Page destination based on type
  const destinationPage = type === "spot" ? "/market/spot" : "/market/perp";

  // Obtenir la classe de couleur en fonction du changement de prix
  const getChangeColorClass = (change: number) => {
    if (change > 0) return "text-[#83E9FF]";
    if (change < 0) return "text-red-500";
    return "text-white";
  };

  // Gérer le tri des colonnes
  const handleSort = (field: SortType) => {
    const newOrder: SortOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(field);
    setSortOrder(newOrder);
    
    if (type === "perp") {
      // Pour le perp, on ne met à jour que si le champ est valide
      if (isPerpSortableField(field)) {
        const perpParams = {
          sortBy: field,
          sortOrder: newOrder
        };
        updatePerpParams(perpParams);
      }
    } else {
      // Pour le spot, pas de restriction sur les champs
      const spotParams = {
        sortBy: field,
        sortOrder: newOrder
      };
      updateSpotParams(spotParams);
    }
  };

  // Obtenir la classe pour l'en-tête de colonne triable
  const getSortableHeaderClass = (field: SortType) => {
    const isActive = sortBy === field;
    return `text-[#FFFFFF99] font-normal hover:text-white cursor-pointer transition-colors ${isActive ? 'text-white' : ''}`;
  };

  // Fonction pour formater les valeurs numériques
  const formatValue = (value: number, options?: { decimals?: number }) => {
    return formatNumber(value, format, {
      minimumFractionDigits: 0,
      maximumFractionDigits: options?.decimals || 2,
      currency: '$',
      showCurrency: true
    });
  };

  if (isLoading) {
    return (
      <div className="w-full md:w-[48%] lg:w-[49%] flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full md:w-[48%] lg:w-[49%] flex justify-center items-center">
        <p className="text-red-500">Une erreur est survenue lors du chargement des données</p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[49%] lg:w-[49.5%]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] text-white font-medium">
          {title || (type === "perp" ? "Trending perpetual" : "Trending spot")}
        </h3>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#FFFFFF99]">Volume:</span>
            <span className="text-sm text-white">
              {formatLargeNumber(totalVolume || 0, { prefix: '$', decimals: 1, forceDecimals: true })}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#FFFFFF99]">
              {type === "spot" ? "Daily Fees:" : "Open Interest:"}
            </span>
            <span className="text-sm text-white">
              {type === "spot" 
                ? formatLargeNumber(feesStats?.dailySpotFees || 0, { prefix: '$', decimals: 1, forceDecimals: true })
                : formatLargeNumber(perpStats?.totalOpenInterest || 0, { prefix: '$', decimals: 1, forceDecimals: true })}
            </span>
          </div>
        </div>

        <Link href={type === "spot" ? "/market/spot" : "/market/perp"} passHref>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 bg-[#83E9FF08] hover:bg-[#83E9FF14] transition-colors"
          >
            <span className="text-[#83E9FF] text-xs">See All</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5 text-[#83E9FF]" strokeWidth={1.5} />
          </Button>
        </Link>
      </div>
      
      <Card className="w-full p-0 bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-xl">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-[#051728]">
                <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pl-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("name")}
                    className="text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center"
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("price")}
                    className="text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center ml-auto justify-end w-full"
                  >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("change24h")}
                    className="text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center ml-auto justify-end w-full"
                  >
                    24h
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="text-[#FFFFFF99] font-normal py-1 bg-[#051728] pr-4">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(type === "perp" ? "openInterest" : "volume")}
                    className="text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center ml-auto justify-end w-full"
                  >
                    {type === "perp" ? "Open Interest" : "Volume"}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-[#051728]">
              {tokens && tokens.length > 0 ? (
                tokens.map((token) => (
                  <TableRow
                    key={token.name}
                    className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors"
                  >
                    <TableCell className="py-2 pl-4">
                      <div className="flex items-center gap-2">
                        {token.logo ? (
                          <img src={token.logo} alt={token.name} className="w-5 h-5 rounded mr-2 object-contain" />
                        ) : (
                          <div className="w-5 h-5 rounded mr-2 bg-[#051728] border border-[#83E9FF33] flex items-center justify-center">
                            <span className="text-[#83E9FF] text-xs">{token.name.charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-white text-sm">{token.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-white text-sm py-2">
                      {formatValue(token.price)}
                    </TableCell>
                    <TableCell className="text-right text-sm py-2">
                      <span style={{color: token.change24h < 0 ? '#FF4D4F' : '#52C41A'}}>
                        {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-white text-sm py-2 pr-4">
                      {formatValue(type === "perp" ? (token as PerpMarketData).openInterest : token.volume)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
                      <p className="text-white text-lg">Aucun token disponible</p>
                      <p className="text-[#FFFFFF80] text-sm mt-2">Vérifiez plus tard</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}