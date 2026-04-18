"use client";

import {
  PerpDexStatsCard,
  PerpDexTable,
  TopPerpDexsCard,
  TopHip3MarketsCard,
  PastAuctionsPerpTable,
} from "@/components/market/perpDex";
import { PerpDexIndexerHubPanel } from "@/components/market/perpDex/analytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PerpDexsPage() {
  return (
    <div className="space-y-6">
      {/* Overview cards — Hyperliquid live */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-5">
        <PerpDexStatsCard />
        <TopPerpDexsCard />
        <TopHip3MarketsCard />
      </div>

      <Tabs defaultValue="builder-dexs" className="w-full">
        <TabsList className="bg-brand-secondary/60 border border-border-subtle p-1 rounded-xl mb-4 flex flex-wrap h-auto gap-1">
          <TabsTrigger
            value="builder-dexs"
            className="data-[state=active]:bg-brand-accent/20 data-[state=active]:text-brand-accent text-text-secondary px-4 py-2 rounded-lg transition-all text-sm"
          >
            All Builder DEXs
          </TabsTrigger>
          <TabsTrigger
            value="indexed-analytics"
            className="data-[state=active]:bg-brand-accent/20 data-[state=active]:text-brand-accent text-text-secondary px-4 py-2 rounded-lg transition-all text-sm"
          >
            Indexed analytics
          </TabsTrigger>
          <TabsTrigger
            value="auction-pairs"
            className="data-[state=active]:bg-brand-accent/20 data-[state=active]:text-brand-accent text-text-secondary px-4 py-2 rounded-lg transition-all text-sm"
          >
            Auction Pairs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder-dexs" className="mt-0">
          <PerpDexTable />
        </TabsContent>

        <TabsContent value="indexed-analytics" className="mt-0">
          <PerpDexIndexerHubPanel />
        </TabsContent>

        <TabsContent value="auction-pairs" className="mt-0">
          <PastAuctionsPerpTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
