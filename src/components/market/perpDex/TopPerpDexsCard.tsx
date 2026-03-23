"use client";

import { memo, useMemo } from "react";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { Building2, ChevronRight } from "lucide-react";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { TableEmptyState } from "@/components/ui/table-states";

/** Matches compact TokensTable (Trending spot / perp): padding + column widths */
const headFirst = "pl-3 py-1.5 w-[40%]";
const headMid = "pl-3 py-1.5 w-[30%]";
const headLast = "pl-3 py-1.5 pr-3 w-[30%]";
const cellFirst = "py-1 pl-3";
const cellMid = "py-1 pl-3";
const cellLast = "py-1 pl-3 pr-3";

/**
 * Card showing top PerpDexs by 24h Volume (live data)
 */
export const TopPerpDexsCard = memo(function TopPerpDexsCard() {
  const router = useRouter();
  const { dexs, isLoading, error } = usePerpDexMarketData();

  const topDexs = useMemo(() => {
    return [...dexs]
      .sort((a, b) => b.totalVolume24h - a.totalVolume24h)
      .slice(0, 5);
  }, [dexs]);

  if (isLoading && !topDexs.length) {
    return (
      <div className="w-full h-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden flex flex-col">
        <LoadingState message="Loading..." size="md" withCard={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden flex flex-col">
        <ErrorState title="Failed to load data" withCard={false} />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden flex flex-col">
      {/* Title outside <table> — same pattern as TokensHeader + TokensTable (avoids oversized first header cell) */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border-subtle shrink-0">
        <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center shrink-0">
          <Building2 size={12} className="text-brand-accent" />
        </div>
        <h3 className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">
          Top by Volume
        </h3>
      </div>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1 min-h-0">
        <Table className="h-full">
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent">
              <TableHead className={headFirst}>Name</TableHead>
              <TableHead className={headMid}>24h Vol</TableHead>
              <TableHead className={headLast}>Open Interest</TableHead>
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
                  <TableCell className={cellFirst}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-label text-brand-accent shrink-0">
                        {dex.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white text-[11px] font-medium truncate">{dex.fullName}</span>
                      <ChevronRight className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </TableCell>
                  <TableCell className={`${cellMid} text-left text-white text-[11px] font-medium`}>
                    {dex.totalVolume24h > 0
                      ? formatLargeNumber(dex.totalVolume24h, {
                          prefix: "$",
                          decimals: 1,
                          forceDecimals: false,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className={`${cellLast} text-left text-white text-[11px] font-medium`}>
                    {dex.totalOpenInterest > 0
                      ? formatLargeNumber(dex.totalOpenInterest, {
                          prefix: "$",
                          decimals: 1,
                          forceDecimals: false,
                        })
                      : "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyState colSpan={3} title="No DEXs available" description="Check back later" />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});
