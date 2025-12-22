"use client";

import { AuctionCard, AuctionTable, AuctionChartSection } from "@/components/market/auction";

export function SpotAuctionContent() {
  return (
    <>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <AuctionCard marketType="spot" />
        </div>
        <div className="md:w-2/3">
          <AuctionChartSection marketType="spot" chartHeight={270} />
        </div>
      </div>

      <div>
        <h2 className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-4">
          Past Auctions
        </h2>
        <AuctionTable marketType="spot" />
      </div>
    </>
  );
}
