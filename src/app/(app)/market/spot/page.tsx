"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import { MarketStatsStrip, TokensSection } from "@/components/market/common";
import { AuctionCard } from "@/components/market/auction";
import { PageHeader } from "@/components/common";

export default function Market() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Spot Market");
  }, [setTitle]);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Spot Market"
        description="Spot tokens on HyperLiquid — global market stats, recent auction activity, and the full token directory."
      />

      {/* KPI strip */}
      <MarketStatsStrip market="spot" />

      {/* Auction status — featured widget */}
      <AuctionCard marketType="spot" />

      {/* Token directory — main table */}
      <TokensSection market="spot" />
    </motion.div>
  );
}
