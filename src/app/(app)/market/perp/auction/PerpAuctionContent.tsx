"use client";

import { AuctionCard, AuctionChartSection } from "@/components/market/auction";
import { PastAuctionsPerpTable } from "@/components/market/perpDex";
import { PageFaq, PageHeader, DataStatus, SourceBadge, sourceStatus } from "@/components/common";
import { usePerpAuctionTiming } from "@/services/market/auction/hooks/usePerpAuctionTiming";
import { usePastAuctionsPerp } from "@/services/market/perpDex/hooks";
import { PERP_AUCTION_FAQ } from "@/lib/page-faqs";

export function PerpAuctionContent() {
  // Page-level freshness cue for the live perp auction timing (the same GET is
  // 30s-cached, so this shares AuctionCard's fetch rather than doubling it).
  const timing = usePerpAuctionTiming();
  // Same story for the past auctions (Hypurrscan) — shares the table's GET.
  const pastAuctions = usePastAuctionsPerp();

  return (
    <>
      <PageHeader
        title="Deploy auctions"
        titleQualifier="· HIP-3 perp DEXs"
        description="The dutch auction every builder-deployed perp DEX draws from — live state, price in HYPE, and the full record of past deployments."
        actions={
          <DataStatus
            variant="polled"
            updatedAt={timing.dataUpdatedAt}
            isRefreshing={timing.isRefreshing}
            onRefresh={timing.refetch}
          />
        }
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
        <div className="flex items-center mb-4">
          <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
            Recent Auction Pairs
          </h2>
          <SourceBadge
            source="hypurrscan"
            status={sourceStatus(pastAuctions.error, pastAuctions.isLoading)}
            className="ml-auto"
          />
        </div>
        <PastAuctionsPerpTable />
      </div>

      <PageFaq items={PERP_AUCTION_FAQ} />
    </>
  );
}
