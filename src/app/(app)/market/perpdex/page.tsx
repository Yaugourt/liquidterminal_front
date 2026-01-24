"use client";

import {
  PerpDexStatsCard,
  PerpDexTable,
  TopPerpDexsCard,
  Hip3InfoCard,
  PastAuctionsPerpTable
} from "@/components/market/perpDex";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function PerpDexsPage() {
  return (
    <>
      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <PerpDexStatsCard />
        <TopPerpDexsCard />
        <Hip3InfoCard />
      </div>

      {/* Tables with Tabs */}
      <Tabs defaultValue="builder-dexs" className="w-full">
        <TabsList className="bg-brand-secondary/60 border border-border-subtle p-1 rounded-xl mb-4">
          <TabsTrigger
            value="builder-dexs"
            className="data-[state=active]:bg-brand-accent/20 data-[state=active]:text-brand-accent text-text-secondary px-4 py-2 rounded-lg transition-all"
          >
            All Builder DEXs
          </TabsTrigger>
          <TabsTrigger
            value="auction-pairs"
            className="data-[state=active]:bg-brand-accent/20 data-[state=active]:text-brand-accent text-text-secondary px-4 py-2 rounded-lg transition-all"
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
