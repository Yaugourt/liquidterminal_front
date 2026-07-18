"use client";

import { AuctionCard, AuctionChartSection } from "@/components/market/auction";
import { PastAuctionsPerpTable } from "@/components/market/perpDex";
import { PageFaq, PageHeader } from "@/components/common";
import { PERP_AUCTION_FAQ } from "@/lib/page-faqs";

export function PerpAuctionContent() {
  return (
    <>
      <PageHeader
        title="Deploy auctions"
        titleQualifier="· HIP-3 perp DEXs"
        description="The dutch auction every builder-deployed perp DEX draws from — live state, price in HYPE, and the full record of past deployments."
      />

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

      <PageFaq items={PERP_AUCTION_FAQ} />
    </>
  );
}
