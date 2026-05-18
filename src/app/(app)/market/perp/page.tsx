"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import { MarketStatsStrip, TokensSection } from "@/components/market/common";
import { AuctionCard, RecentAuctionsCard } from "@/components/market/auction";
import { PageHeader } from "@/components/common";

export default function MarketPerp() {
  const { setTitle } = usePageTitle();

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
        description="Perpetual markets on HyperLiquid — global stats, open interest, funding rates, and the full perp directory."
      />

      {/* KPI strip */}
      <MarketStatsStrip market="perp" />

      {/* Auction — status (left) + 5 recent auctions (right) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.3fr] gap-4 items-stretch">
        <AuctionCard marketType="perp" />
        <RecentAuctionsCard />
      </div>

      {/* Token directory — main table */}
      <TokensSection market="perp" />
    </motion.div>
  );
}
