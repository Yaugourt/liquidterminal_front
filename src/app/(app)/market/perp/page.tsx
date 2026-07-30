"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import { MarketStatsStrip, TokensSection } from "@/components/market/common";
import { AuctionCard, RecentAuctionsCard } from "@/components/market/auction";
import { PageHeader, PageFaq, DataStatus } from "@/components/common";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";
import { PERP_FAQ } from "@/lib/page-faqs";

export default function MarketPerp() {
  const { setTitle } = usePageTitle();
  // Page-level freshness cue for the perp global stats strip (the same GET is
  // 30s-cached, so this shares MarketStatsStrip's fetch rather than doubling it).
  const globalStats = usePerpGlobalStats();

  useEffect(() => {
    setTitle("Perpetuals");
  }, [setTitle]);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Perpetuals"
        titleQualifier="on Hyperliquid"
        description="Perpetual markets on Hyperliquid — global stats, open interest, funding rates, and the full perp directory."
        actions={
          <DataStatus
            variant="polled"
            updatedAt={globalStats.dataUpdatedAt}
            isRefreshing={globalStats.isRefreshing}
            onRefresh={globalStats.refetch}
          />
        }
      />

      {/* KPI strip */}
      <MarketStatsStrip market="perp" />

      {/* Auction — status (left) + 5 recent auctions (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-4 items-start">
        <AuctionCard marketType="perp" />
        <RecentAuctionsCard />
      </div>

      {/* Token directory — main table */}
      <TokensSection market="perp" />
      <PageFaq items={PERP_FAQ} />
    </motion.div>
  );
}
