"use client";

import { DataStatus } from "@/components/common";
import { SectionHead } from "@/components/dashboard/SectionHead";
import {
  FeeRankCard,
  FeesRevenueHistoryCard,
  IncomeStatementCard,
  QuarterlyRevenueCard,
  RevenueMixHistoryCard,
  RevenueReconciliation,
  RevenueSegmentsCard,
} from "@/components/hype";
import { useProtocolFundamentals } from "@/services/market/fundamentals";

/**
 * HYPE · Financials — Hyperliquid read as a business.
 *
 * The premise: a protocol that charges fees, redistributes part of them and
 * keeps the rest is an operating company, and the questions an equity analyst
 * asks of one apply here. What is the gross margin. Where does revenue come
 * from. Is either of them holding up.
 *
 * Ordered the way a statement is read. Levels first: what the last period
 * earned and how the segments split. Then the same figures as a series, which
 * is where the actual claim lives — a margin is a number, a margin over
 * eighteen months is an argument about whether the take is being competed away.
 *
 * Two sources on purpose. The daily split uses DefiLlama, because that is the
 * basis the market quotes when it compares venues and the only public one that
 * separates fees from revenue. The mix uses our own endpoint, which carries a
 * six-way breakdown no public aggregate has. They do not agree, so the
 * reconciliation card says by how much and why rather than leaving the reader
 * to notice.
 */
export default function HypeFinancialsPage() {
  // Page-level freshness cue wired to the fundamentals feeding the income
  // statement (the leading card). Same default slug, so it shares that fetch.
  const { dataUpdatedAt, isRefreshing, refetch } = useProtocolFundamentals();

  return (
    <div className="space-y-8">
      <section className="space-y-2.5">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
          <SectionHead
            title="Statements"
            subtitle="What users paid, what was redistributed, what the protocol kept"
          />
          <DataStatus
            variant="polled"
            updatedAt={dataUpdatedAt}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
          />
        </div>
        {/* Two columns only from xl: at 1024 a 364px card cannot hold its own
            header (title + total pill + timeframe tabs) without clipping. */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <IncomeStatementCard />
          <RevenueSegmentsCard />
        </div>
        {/* Where those fees place Hyperliquid against the whole public field —
            the same DefiLlama basis the statements above quote. */}
        <FeeRankCard />
        <RevenueReconciliation />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Trend"
          subtitle="The same split day by day and quarter by quarter · is the margin holding"
        />
        <FeesRevenueHistoryCard />
        <QuarterlyRevenueCard />
      </section>

      <section className="space-y-2.5">
        <SectionHead
          title="Segments over time"
          subtitle="Six revenue sources · whether this is still one book or several"
        />
        <RevenueMixHistoryCard />
      </section>
    </div>
  );
}
