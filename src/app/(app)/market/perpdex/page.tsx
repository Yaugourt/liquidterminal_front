"use client";

import {
  PerpDexStatsCard,
  PerpDexTable,
  TopPerpDexsCard,
  TopHip3MarketsCard,
  PastAuctionsPerpTable
} from "@/components/market/perpDex";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/common";

export default function PerpDexsPage() {
  return (
    <>
      <PageHeader
        title="Perp DEX"
        description="Builder-deployed perp DEXs on HyperLiquid — ecosystem stats, top venues, HIP-3 markets, and auction pairs."
      />

      {/* Overview cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-5">
        <PerpDexStatsCard />
        <TopPerpDexsCard />
        <TopHip3MarketsCard />
      </div>

      {/* Tables with Tabs */}
      <Tabs defaultValue="builder-dexs" className="w-full">
        <TabsList className="bg-surface/60 border border-border-subtle p-1 rounded-xl mb-4">
          <TabsTrigger
            value="builder-dexs"
            className="data-[state=active]:bg-brand/20 data-[state=active]:text-brand text-text-secondary px-4 py-2 rounded-lg transition-all"
          >
            All Builder DEXs
          </TabsTrigger>
          <TabsTrigger
            value="auction-pairs"
            className="data-[state=active]:bg-brand/20 data-[state=active]:text-brand text-text-secondary px-4 py-2 rounded-lg transition-all"
          >
            Auction Pairs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder-dexs" className="mt-0">
          <PerpDexTable />
        </TabsContent>

        <TabsContent value="auction-pairs" className="mt-0">
          <PastAuctionsPerpTable />
        </TabsContent>
      </Tabs>
    </>
  );
}
