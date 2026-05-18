"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import { MarketStatsStrip, TokensSection } from "@/components/market/common";
import { AuctionCard } from "@/components/market/auction";
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

      {/* Auction status — featured widget */}
      <AuctionCard marketType="perp" />

      {/* Token directory — main table */}
      <TokensSection market="perp" />
    </motion.div>
  );
}
