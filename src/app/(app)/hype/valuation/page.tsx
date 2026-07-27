"use client";

import { SectionHead } from "@/components/dashboard/SectionHead";
import { MultipleHistoryCard, ValuationMultiplesCard } from "@/components/hype";

/**
 * HYPE · Valuation — what the market is paying for the earnings.
 *
 * The other chapters describe the business. This one prices it, which is the
 * only place the equity framing actually pays off: a venue can be growing,
 * high-margin and returning most of its revenue to holders and still be
 * expensive, and no operating metric will ever say so.
 *
 * Two cards on purpose. The level answers "what is it trading at", the series
 * answers "compared to what" — a 90x multiple means nothing until you know the
 * token spent the last year between 60x and 200x.
 *
 * Nothing here is a target or a fair value. Every figure is a ratio of two
 * measured quantities, and the moment we start multiplying assumptions
 * together we are publishing an opinion with a number attached to it.
 */
export default function HypeValuationPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2.5">
        <SectionHead
          title="Multiples"
          subtitle="Price against trailing twelve months of fees and earnings · both supply bases"
        />
        <ValuationMultiplesCard />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Re-rating"
          subtitle="Whether the price is following the earnings or moving away from them"
        />
        <MultipleHistoryCard />
      </section>
    </div>
  );
}
