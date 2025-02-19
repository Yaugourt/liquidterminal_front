"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { useRouter } from "next/navigation";

interface Token {
  name: string;
  logo: string | null;
  price: number;
  marketCap: number;
  volume: number;
  change24h: number;
  liquidity: number;
  supply: number;
}

type SortConfig = {
  key: keyof Token | null;
  direction: "asc" | "desc";
};

interface TokenTableProps {
  tokens: Token[];
  loading: boolean;
}

export function TokenTable({ tokens, loading }: TokenTableProps) {
  const router = useRouter();
  const [sortedTokens, setSortedTokens] = useState<Token[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "volume",
    direction: "desc",
  });

  useEffect(() => {
    // Tri initial par volume décroissant
    const initialSortedTokens = [...tokens].sort((a, b) => b.volume - a.volume);
    setSortedTokens(initialSortedTokens);
  }, [tokens]);

  const sortData = (key: keyof Token) => {
    let direction: "asc" | "desc" = "asc";

    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const newSortedTokens = [...sortedTokens].sort((a, b) => {
      // Vérification des valeurs nulles
      const valueA = a[key];
      const valueB = b[key];

      if (valueA === null && valueB === null) return 0;
      if (valueA === null) return direction === "asc" ? -1 : 1;
      if (valueB === null) return direction === "asc" ? 1 : -1;

      // Comparaison sûre des valeurs non nulles
      if (valueA < valueB) return direction === "asc" ? -1 : 1;
      if (valueA > valueB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortedTokens(newSortedTokens);
    setSortConfig({ key, direction });
  };

  const handleTokenClick = (tokenName: string) => {
    router.push(`/market/${encodeURIComponent(tokenName)}`);
  };

  if (loading) {
    return <div className="text-white p-4">Chargement...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-none">
            <TableHead className="text-[#FFFFFF99] font-normal py-2 bg-transparent pl-4">
              <Button
                variant="ghost"
                onClick={() => sortData("name")}
                className="text-[#FFFFFF99] font-normal hover:text-white p-0 flex items-center"
              >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-[#FFFFFF99] font-normal py-2 bg-transparent">
              <Button
                variant="ghost"
                onClick={() => sortData("price")}
                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto flex items-center justify-end w-full"
              >
                Price
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent">
              <Button
                variant="ghost"
                onClick={() => sortData("marketCap")}
                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
              >
                Market Cap
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent">
              <Button
                variant="ghost"
                onClick={() => sortData("volume")}
                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
              >
                Volume
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-right text-[#FFFFFF99] font-normal py-2 bg-transparent">
              <Button
                variant="ghost"
                onClick={() => sortData("change24h")}
                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto"
              >
                Change 24h
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="text-[#FFFFFF99] font-normal py-2 bg-transparent pr-4">
              <Button
                variant="ghost"
                onClick={() => sortData("supply")}
                className="text-[#FFFFFF99] font-normal hover:text-white p-0 ml-auto flex items-center justify-end w-full"
              >
                Supply
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTokens.map((token) => (
            <TableRow
              key={token.name}
              className="border-t border-[#FFFFFF1A] hover:bg-[#FFFFFF0A]"
            >
              <TableCell className="py-2 pl-4">
                <div className="flex items-center gap-2">
                  <img
                    src={`/images/tokens/${token.name}.svg`}
                    alt={token.name}
                    className="w-6 h-6"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes("backup")) {
                        target.src = `https://app.hyperliquid.xyz/coins/${token.name.toUpperCase()}_USDC.svg`;
                      } else {
                        target.src = "/images/tokens/default-token.svg";
                      }
                    }}
                  />
                  <span className="text-white">{token.name}</span>
                </div>
              </TableCell>
              <TableCell className="py-2 text-right text-white">
                ${formatNumber(token.price)}
              </TableCell>
              <TableCell className="text-right text-white">
                ${formatNumber(token.marketCap)}
              </TableCell>
              <TableCell className="text-right text-white">
                ${formatNumber(token.volume)}
              </TableCell>
              <TableCell
                className={`text-right ${
                  token.change24h >= 0 ? "text-[#26A69A]" : "text-[#FF5252]"
                }`}
              >
                {token.change24h >= 0 ? "+" : ""}
                {token.change24h}%
              </TableCell>
              <TableCell className="text-right text-white pr-4">
                {formatNumber(token.supply)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
