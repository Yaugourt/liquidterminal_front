import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Token, PerpToken } from "@/services/markets/types";
import { formatNumberWithoutDecimals } from "@/components/market/stats/utils";
import { useEffect, useState } from "react";
import { getTrendingPerpTokens, getTrendingSpotTokens } from "@/services/dashboard/api";
import { Loader2 } from "lucide-react";

interface TransactionsTableProps {
  type: "perp" | "spot";
  title?: string;
}

export function TransactionsTable({ type, title }: TransactionsTableProps) {
  const [tokens, setTokens] = useState<(Token | PerpToken)[]>([]);
  const [loading, setLoading] = useState(true);
  const [volume, setVolume] = useState("0");
  const [count, setCount] = useState("0");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let data: (Token | PerpToken)[] = [];
        
        if (type === "perp") {
          data = await getTrendingPerpTokens();
        } else {
          data = await getTrendingSpotTokens();
        }
        
        setTokens(data);
        
        // Calculer le volume total
        const totalVolume = data.reduce((sum, token) => sum + token.volume, 0);
        setVolume(formatNumberWithoutDecimals(totalVolume));
        setCount(data.length.toString());
      } catch (error) {
        console.error(`Erreur lors du chargement des tokens ${type}:`, error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [type]);

  // Obtenir la classe de couleur en fonction du changement de prix
  const getChangeColorClass = (change: number) => {
    if (change > 0) return "text-[#83E9FF]"; // Bleu pour positif (comme dans le design)
    if (change < 0) return "text-red-500";
    return "text-white";
  };

  return (
    <div className="w-full md:w-[48%] lg:w-[49%]">
      <div className="flex justify-center gap-4 sm:gap-10 mb-2 w-full">
        <div className="text-white">
          <span className="text-[#FFFFFFCC] text-xs sm:text-sm font-normal">Volume:</span>
          <span className="ml-2 text-[#83E9FF] text-base sm:text-[20px] font-medium text-right">
            ${volume}
          </span>
        </div>
        <div className="text-white">
          <span className="text-[#FFFFFFCC] text-xs sm:text-sm font-normal">Tokens:</span>
          <span className="ml-2 text-[#83E9FF] text-base sm:text-[20px] font-medium text-right">
            {count}
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-6 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-6 h-6 text-[#83E9FF4D] animate-spin mb-2" />
                      <p className="text-[#FFFFFF99] text-sm">Chargement des données...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : tokens.length > 0 ? (
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
                  <TableCell colSpan={4} className="p-6 text-center">
                    <p className="text-[#FFFFFF99] text-sm">Aucune donnée disponible</p>
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