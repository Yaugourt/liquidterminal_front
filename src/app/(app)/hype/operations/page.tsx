"use client";

import { SectionHead } from "@/components/dashboard/SectionHead";
import { OperatingMetricsCard } from "@/components/hype";

/**
 * HYPE · Operations — what the venue actually moved.
 *
 * The financial statements say what the business earned; this says what it did
 * to earn it. Volume, open interest, how often the book turns, how many
 * accounts traded.
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
    </div>
  );
}
