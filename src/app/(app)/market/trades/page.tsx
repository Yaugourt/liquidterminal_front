"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { PageHeader } from "@/components/common";
import { TradeExplorer } from "@/components/market/trades/TradeExplorer";

/**
 * /market/trades — market-wide trade explorer. Every closed round-trip on
 * Hyperliquid, filterable by coin and sortable by realized PnL, volume or hold
 * time. A page-level view no competitor surfaces.
 */
export default function TradesPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Trade Explorer");
  }, [setTitle]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Trade Explorer"
        titleQualifier="for Hyperliquid"
        description="Every closed round-trip trade on Hyperliquid, entry to exit. Filter by coin and sort by realized PnL, volume or hold time."
      />
      <TradeExplorer />
    </div>
  );
}
