"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import { MarketStatsStrip, TokensSection } from "@/components/market/common";
import { AuctionCard } from "@/components/market/auction";
import { PageHeader } from "@/components/common";
import { Card } from "@/components/ui/card";

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

      {/* Table + Auction side by side on wide screens */}
      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">
        <Card className="overflow-hidden p-0">
          <TokensSection market="perp" />
        </Card>
        <AuctionCard marketType="perp" />
      </div>
    </motion.div>
  );
}
