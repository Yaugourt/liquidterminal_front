"use client";

import { DataStatus } from "@/components/common";
import { SectionHead } from "@/components/dashboard/SectionHead";
import { FeeRunRateCard, OperatingMetricsCard, TvlHistoryCard } from "@/components/hype";
import { usePerpGlobalStats } from "@/services/market/perp/hooks/usePerpGlobalStats";

/**
 * HYPE · Operations — what the venue actually moved.
 *
 * The financial statements say what the business earned; this says what it did
 * to earn it. Volume, open interest, how often the book turns, how many
 * accounts traded.
 *
 * The run rate is the only series here, and it is hourly rather than daily on
 * purpose: everything else on the token page reports days, and the session
 * cycle is invisible at that resolution. There is no volume history to sit
 * beside it. The public aggregate that carries perp notional is paywalled and
 * we keep only a live snapshot of our own, so a volume series would have to be
 * invented rather than measured.
 */
export default function HypeOperationsPage() {
  // Page-level freshness cue wired to the perp snapshot that drives the
  // Activity card (volume / open interest), the venue's core polled metric.
  const { dataUpdatedAt, isRefreshing, refetch } = usePerpGlobalStats();

  return (
    <div className="space-y-8">
      <section className="space-y-2.5">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <SectionHead
            title="Activity"
            subtitle="Volume, open interest and accounts over the last 24 hours"
          />
          <DataStatus
            variant="polled"
            updatedAt={dataUpdatedAt}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
          />
        </div>
        <OperatingMetricsCard />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Run rate"
          subtitle="Fees charged per hour, perp against spot · the session cycle"
        />
        <FeeRunRateCard />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Deposit base"
          subtitle="Collateral parked on the venue · the slowest number the protocol has"
        />
        <TvlHistoryCard />
      </section>
    </div>
  );
}
