"use client";

import { useEffect } from "react";
import { ExternalLink } from "lucide-react";
import { usePageTitle } from "@/store/use-page-title";
import { PageHeader, PageFaq } from "@/components/common";
import { SPOT_AUCTION_FAQ } from "@/lib/page-faqs";
import { SectionHead } from "@/components/dashboard/SectionHead";
import {
  AuctionKpiStrip,
  AuctionHistoryShape,
  AuctionHistoryTable,
} from "@/components/market/auction";
import { useAuctionHistory } from "@/services/market/auction/hooks/useAuctionHistory";

/**
 * /market/spot/auction — V4, composed on the main-dashboard page-type like
 * /market/spot. One `useAuctionHistory` fetch feeds every section (the API
 * returns the full record in a single response).
 */
export function SpotAuctionContent() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Deploy Auctions");
  }, [setTitle]);

  const history = useAuctionHistory();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ticker auctions"
        titleQualifier="· HIP-1 spot deploys"
        description="Every spot ticker sold through the HIP-1 dutch auction since genesis — live state, gas history & full record."
        actions={
          <a
            href="https://app.hyperliquid.xyz/deploySpot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand bg-brand/5 hover:bg-brand/10 rounded-lg border border-brand/10 transition-colors"
          >
            Participate
            <ExternalLink size={12} />
          </a>
        }
      />

      <section className="space-y-2.5">
        <SectionHead
          title="Live"
          subtitle="dutch curve state · 31h cadence · era aggregates"
        />
        <AuctionKpiStrip history={history} />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Gas history"
          subtitle="winning bids per era · most expensive tickers · monthly cadence"
        />
        <AuctionHistoryShape history={history} />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="All deploys"
          subtitle="full auction record · date, deployer, token id & winning bid"
        />
        <AuctionHistoryTable history={history} />
      </section>
      <PageFaq items={SPOT_AUCTION_FAQ} />
    </div>
  );
}
