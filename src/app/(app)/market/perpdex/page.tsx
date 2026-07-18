"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import {
  PerpDexStatsCard,
  PerpDexTable,
  TopPerpDexsCard,
  TopHip3MarketsCard,
  PastAuctionsPerpTable,
} from "@/components/market/perpDex";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common";

export default function PerpDexsPage() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Perp DEX - Market");
  }, [setTitle]);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page header */}
      <PageHeader
        title="Perp DEX"
        description="Builder-deployed perp DEXs on Hyperliquid — ecosystem stats, top venues, HIP-3 markets, and auction pairs."
      />

      {/* Stats strip */}
      <PerpDexStatsCard />

      {/* Secondary cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TopPerpDexsCard />
        <TopHip3MarketsCard />
      </div>

      {/* Table card with integrated tab header */}
      <Tabs defaultValue="builder-dexs" className="w-full">
        <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
          {/* Card header: tabs */}
          <div className="flex items-center px-3.5 py-3 border-b border-border-subtle">
            <TabsList className="bg-surface-2 p-0.5 rounded-md h-auto">
              <TabsTrigger
                value="builder-dexs"
                className="data-[state=active]:bg-brand data-[state=active]:text-brand-text-on data-[state=active]:shadow-none text-text-tertiary px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
              >
                All Builder DEXs
              </TabsTrigger>
              <TabsTrigger
                value="auction-pairs"
                className="data-[state=active]:bg-brand data-[state=active]:text-brand-text-on data-[state=active]:shadow-none text-text-tertiary px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
              >
                Auction Pairs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="builder-dexs" className="mt-0">
            <PerpDexTable />
          </TabsContent>

          <TabsContent value="auction-pairs" className="mt-0">
            <PastAuctionsPerpTable />
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  );
}
