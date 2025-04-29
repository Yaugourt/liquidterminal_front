import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,  
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { formatNumberWithoutDecimals } from "@/lib/formatting";
import { useTopTokens } from "@/services/dashboard/hooks/useTopSpotTokens";
import { useTopPerpTokens } from "@/services/dashboard/hooks/useTopPerpTokens";
import { Loader2 } from "lucide-react";
import { TrendingTokensProps } from "@/components/types/dashboard.types";

export function TrendingTokens({ type, title }: TrendingTokensProps) {
  const spotTokens = useTopTokens(5);
  const perpTokens = useTopPerpTokens(5);
  
  const { tokens, isLoading, error } = type === "spot" ? spotTokens : perpTokens;

  // Obtenir la classe de couleur en fonction du changement de prix
  const getChangeColorClass = (change: number) => {
    if (change > 0) return "text-[#83E9FF]"; // Bleu pour positif (comme dans le design)
    if (change < 0) return "text-red-500";
    return "text-white";
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
    <div className="w-full md:w-[48%] lg:w-[49%]">
      <div className="flex justify-center gap-4 sm:gap-10 mb-2 w-full">
        <div className="text-white">
          <span className="text-[#FFFFFFCC] text-xs sm:text-sm font-normal">Volume:</span>
          <span className="ml-2 text-[#83E9FF] text-base sm:text-[20px] font-medium text-right">
            ${formatNumberWithoutDecimals(Array.isArray(tokens) ? tokens.reduce((sum, token) => sum + token.volume, 0) : 0)}
          </span>
        </div>
        <div className="text-white">
          <span className="text-[#FFFFFFCC] text-xs sm:text-sm font-normal">Tokens:</span>
          <span className="ml-2 text-[#83E9FF] text-base sm:text-[20px] font-medium text-right">
            {Array.isArray(tokens) ? tokens.length : 0}
          </span>
        </div>
      </div>
      <Card className="w-full p-0 bg-[#051728E5] border-2 border-[#83E9FF4D] shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-[#051728] scrollbar-thumb-rounded-full">
          <Table className="border-separate border-spacing-0 rounded-lg min-w-[400px]">
            <TableHeader>
              <TableRow className="hover:bg-[#0B2437]">
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-left p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99]">
                  {title || (type === "perp" ? "Top Perp Tokens" : "Top Spot Tokens")}
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99]">
                  Price
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99]">
                  24h
                </TableHead>
                <TableHead className="border-b-[1px] border-[#83E9FF4D] text-right p-2 sm:p-3 text-xs sm:text-sm font-normal text-[#FFFFFF99]">
                  Volume
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-white">
              {Array.isArray(tokens) && tokens.length > 0 ? (
                tokens.map((token) => (
                  <TableRow key={token.name} className="border-t border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]">
                    <TableCell className="p-2 sm:p-3 text-xs sm:text-sm">{token.name}</TableCell>
                    <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm">
                      ${token.price.toFixed(2)}
                    </TableCell>
                    <TableCell className={`text-right p-2 sm:p-3 text-xs sm:text-sm ${getChangeColorClass(token.change24h)}`}>
                      {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right p-2 sm:p-3 text-xs sm:text-sm">
                      ${formatNumberWithoutDecimals(token.volume)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center p-4 text-gray-400">
                    Aucun token disponible
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