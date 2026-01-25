"use client";

import { AuctionCard, AuctionChartSection } from "@/components/market/auction";
import { PastAuctionsPerpTable } from "@/components/market/perpDex";

export function PerpAuctionContent() {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <AuctionCard marketType="perp" />
        </div>
        <div className="md:w-2/3">
          <AuctionChartSection marketType="perp" chartHeight={270} />
        </div>
      </div>

      <div>
        <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-4">
          Recent Auction Pairs
        </h2>
        <PastAuctionsPerpTable />
      </div>
    </>
  );
}
