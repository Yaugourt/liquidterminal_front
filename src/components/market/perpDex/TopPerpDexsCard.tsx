"use client";

import { memo, useMemo } from "react";
import { usePerpDexMarketData } from "@/services/market/perpDex/hooks";
import { Building2, ChevronRight } from "lucide-react";
import { formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { TypedDataTable, type Column } from "@/components/common";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import type { PerpDexWithMarketData } from "@/services/market/perpDex/types";

const COLUMNS: Column<PerpDexWithMarketData>[] = [
  {
    key: "name",
    header: "Name",
    accessor: (row) => (
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-accent/20 to-brand-gold/20 flex items-center justify-center text-label text-brand-accent shrink-0">
          {row.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-text-primary text-[11px] font-medium truncate">{row.fullName}</span>
        <ChevronRight className="h-3 w-3 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    ),
  },
  {
    key: "totalVolume24h",
    header: "24h Vol",
    type: "fees",
    accessor: (row) =>
      row.totalVolume24h > 0
        ? formatLargeNumber(row.totalVolume24h, { prefix: "$", decimals: 1, forceDecimals: false })
        : "-",
  },
  {
    key: "totalOpenInterest",
    header: "Open Interest",
    type: "numeric",
    accessor: (row) =>
      row.totalOpenInterest > 0
        ? formatLargeNumber(row.totalOpenInterest, { prefix: "$", decimals: 1, forceDecimals: false })
        : "-",
  },
];

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

  return (
    <Card className="w-full h-full overflow-hidden flex flex-col">
      {/* Title outside <table> — same pattern as TokensHeader + TokensTable */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border-subtle shrink-0">
        <div className="w-6 h-6 rounded-lg bg-brand-accent/10 flex items-center justify-center shrink-0">
          <Building2 size={12} className="text-brand-accent" />
        </div>
        <h3 className="text-[10px] font-normal uppercase tracking-wide text-text-secondary">
          Top by Volume
        </h3>
      </div>

      <div className="flex-1 min-h-0">
        <TypedDataTable<PerpDexWithMarketData>
          data={topDexs}
          columns={COLUMNS}
          getRowKey={(row) => row.name}
          isLoading={isLoading && topDexs.length === 0}
          error={error}
          errorTitle="Failed to load data"
          emptyMessage="No DEXs available"
          emptyDescription="Check back later"
          density="compact"
          onRowClick={(row) => router.push(`/market/perpdex/${row.name}`)}
          rowClassName="group"
        />
      </div>
    </Card>
  );
});
