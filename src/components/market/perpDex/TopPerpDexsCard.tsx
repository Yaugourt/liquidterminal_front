"use client";

import { memo, useMemo } from "react";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { Loader2, Database, Building2, ChevronRight } from "lucide-react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNumberFormat } from "@/store/number-format.store";
import { useRouter } from "next/navigation";

/**
 * Card showing top PerpDexs by 24h Volume (live data)
 */
export const TopPerpDexsCard = memo(function TopPerpDexsCard() {
  const router = useRouter();
  const { format } = useNumberFormat();
  const { dexs, isLoading, error } = usePerpDexMarketData();

  // Sort by volume and get top 5
  const topDexs = useMemo(() => {
    return [...dexs]
      .sort((a, b) => b.totalVolume24h - a.totalVolume24h)
      .slice(0, 5);
  }, [dexs]);

  if (isLoading && !topDexs.length) {
    return (
      <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden h-full">
        <div className="flex justify-center items-center h-full py-8">
          <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden h-full">
        <div className="flex justify-center items-center h-full py-8">
          <p className="text-rose-400 text-sm">Failed to load data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden h-full flex flex-col">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1">
        <Table className="h-full">
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent">
              <TableHead className="py-3 pl-4 w-[40%]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                    <Building2 size={12} className="text-brand-accent" />
                  </div>
                  <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Top by Volume</span>
                </div>
              </TableHead>
              <TableHead className="py-3 w-[30%]">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">24h Vol</span>
              </TableHead>
              <TableHead className="py-3 pr-4 w-[30%]">
                <span className="text-text-secondary text-[10px] font-semibold uppercase tracking-wider">Open Interest</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topDexs.length > 0 ? (
              topDexs.map((dex) => (
                <TableRow
                  key={dex.name}
                  className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  onClick={() => router.push(`/market/perpdex/${dex.name}`)}
                >
                  <TableCell className="py-2.5 pl-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-[10px] font-bold text-brand-accent">
                        {dex.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-medium">{dex.fullName}</span>
                        <span className="text-text-muted text-[10px]">
                          {dex.activeAssets}/{dex.totalAssets} markets
                        </span>
                      </div>
                      <ChevronRight className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </TableCell>
                  <TableCell className="text-left text-white text-xs py-2.5 font-medium">
                    {dex.totalVolume24h > 0 
                      ? formatNumber(dex.totalVolume24h, format, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                          currency: '$',
                          showCurrency: true
                        })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-left text-white text-xs py-2.5 pr-4 font-medium">
                    {dex.totalOpenInterest > 0 
                      ? formatNumber(dex.totalOpenInterest, format, {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                          currency: '$',
                          showCurrency: true
                        })
                      : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center">
                    <Database className="w-10 h-10 mb-3 text-text-muted" />
                    <p className="text-text-secondary text-sm mb-1">No DEXs available</p>
                    <p className="text-text-muted text-xs">Check back later</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

