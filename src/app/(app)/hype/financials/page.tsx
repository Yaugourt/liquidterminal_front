"use client";

import { SectionHead } from "@/components/dashboard/SectionHead";
import {
  IncomeStatementCard,
  RevenueReconciliation,
  RevenueSegmentsCard,
} from "@/components/hype";

/**
 * HYPE · Financials — Hyperliquid read as a business.
 *
 * The premise: a protocol that charges fees, redistributes part of them and
 * keeps the rest is an operating company, and the questions an equity analyst
 * asks of one apply here. What is the gross margin. Where does revenue come
 * from. How concentrated is it.
 *
 * Two sources on purpose. The income statement uses DefiLlama, because that is
 * the basis the market quotes when it compares venues and the only public one
 * that splits fees from revenue. The segment view uses our own endpoint, which
 * is more granular and carries a six-way breakdown no public aggregate has.
 * They do not agree, so the third card says by how much and why rather than
 * leaving the reader to notice.
 */
export default function HypeFinancialsPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-2.5">
        <SectionHead
          title="Statements"
          subtitle="What users paid, what was redistributed, what the protocol kept"
        />
        {/* Two columns only from xl: at 1024 a 364px card cannot hold its own
            header (title + total pill + timeframe tabs) without clipping. */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <IncomeStatementCard />
          <RevenueSegmentsCard />
        </div>
        <RevenueReconciliation />
      </section>
    </div>
  );
}
