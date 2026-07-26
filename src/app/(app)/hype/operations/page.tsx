"use client";

import { SectionHead } from "@/components/dashboard/SectionHead";
import { FeeRunRateCard, OperatingMetricsCard, TvlHistoryCard } from "@/components/hype";

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
  return (
    <div className="space-y-8">
      <section className="space-y-2.5">
        <SectionHead
          title="Activity"
          subtitle="Volume, open interest and accounts over the last 24 hours"
        />
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
