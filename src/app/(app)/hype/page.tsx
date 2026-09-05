"use client";

import { DataStatus, PageFaq } from "@/components/common";
import { SectionHead } from "@/components/dashboard/SectionHead";
import { HypeHeroRibbon, HypePriceChart, HypeRelativePerformanceCard, RevenueFlywheelCard } from "@/components/hype";
import { useRevenueBreakdown } from "@/services/market/revenue";
import { HYPE_FAQ } from "@/lib/page-faqs";

/**
 * HYPE · Overview — the live state of Hyperliquid's native asset.
 *
 * The header, quote and scope bar live in the layout; this route owns the
 * overview only: the quote, the chart, and the one diagram that explains how
 * fees turn into buybacks. Everything that needs analysis rather than a glance
 * moved to its own chapter — supply and buybacks to Capital, the statements to
 * Financials, volume and accounts to Operations.
 *
 * The page used to stack all five, which meant the price sat above 2,500px of
 * mechanics nobody scrolled to.
 */
export default function HypePage() {
  // Page-level freshness cue for the polled fundamentals (revenue/valuation).
  // "7d" matches the hero ribbon's own window so the two share one fetch.
  const { dataUpdatedAt, isRefreshing, refetch } = useRevenueBreakdown("7d");

  return (
    <div className="space-y-8">
      <section className="space-y-2.5">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <SectionHead title="Overview" subtitle="Live price, valuation & headline supply" />
          <DataStatus
            variant="polled"
            updatedAt={dataUpdatedAt}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
          />
        </div>
        <HypeHeroRibbon />
        <HypePriceChart />
        <HypeRelativePerformanceCard />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="The Flywheel"
          subtitle="How protocol fees become a buyback · the mechanics in one picture"
        />
        <RevenueFlywheelCard />
      </section>

      <PageFaq items={HYPE_FAQ} />
    </div>
  );
}
