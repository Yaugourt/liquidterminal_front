"use client";

import { memo, useMemo, useState } from "react";
import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartError, ChartLoading, TimeframeTabs } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { Timeframe } from "@/lib/timeframe";
import {
  toIncomeStatement,
  useProtocolFundamentals,
  type FundamentalsPeriod,
} from "@/services/market/fundamentals";

/**
 * Hyperliquid's income statement.
 *
 * Read as a business: users pay fees, a share is redistributed to the people
 * who provide the liquidity and the order flow, and what remains is what the
 * protocol actually earns. Laid out as a statement rather than a KPI strip
 * because the shape of the thing is the point — the subtotal has to sit under
 * the lines that produce it.
 *
 * The middle line is derived (fees − revenue), so it aggregates every payout
 * and cannot be split further from this source. Said plainly in the footer
 * rather than implied.
 */

/** The aggregate reports these four windows and no others. */
const PERIODS: { tf: Timeframe; period: FundamentalsPeriod; copy: string }[] = [
  { tf: "24h", period: "total24h", copy: "last 24 hours" },
  { tf: "7d", period: "total7d", copy: "last 7 days" },
  { tf: "30d", period: "total30d", copy: "last 30 days" },
  { tf: "all", period: "totalAllTime", copy: "since launch" },
];

const pct = (value: number | null, digits = 1): string =>
  value == null ? "—" : `${(value * 100).toFixed(digits)}%`;

interface LineProps {
  label: string;
  value: number | null;
  /** Indented, muted: a deduction rather than a total. */
  deduction?: boolean;
  /** Ruled above and heavier: a subtotal. */
  total?: boolean;
  hint?: string;
}

function Line({ label, value, deduction, total, hint }: LineProps) {
  return (
    <div
      className={`flex items-baseline gap-3 py-2 ${
        total ? "border-t border-border-default mt-1 pt-3" : ""
      }`}
    >
      <div className={`flex flex-col ${deduction ? "pl-4" : ""}`}>
        <span
          className={`text-[13px] ${
            total
              ? "text-text-primary font-semibold"
              : deduction
                ? "text-text-tertiary"
                : "text-text-secondary"
          }`}
        >
          {label}
        </span>
        {hint && <span className="text-[10.5px] text-text-tertiary/80 mt-0.5">{hint}</span>}
      </div>
      <span
        className={`ml-auto mono tabular-nums ${
          total
            ? "text-[19px] font-semibold text-text-primary"
            : deduction
              ? "text-[14px] text-text-tertiary"
              : "text-[14px] text-text-secondary"
        }`}
      >
        {value == null ? "—" : `${deduction ? "−" : ""}${compactUsd(Math.abs(value))}`}
      </span>
    </div>
  );
}

export const IncomeStatementCard = memo(function IncomeStatementCard() {
  const [tf, setTf] = useState<Timeframe>("30d");
  const { fundamentals, isLoading, error } = useProtocolFundamentals();

  const entry = PERIODS.find((p) => p.tf === tf) ?? PERIODS[2];
  const statement = useMemo(
    () => toIncomeStatement(fundamentals, entry.period),
    [fundamentals, entry.period]
  );

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* flex-wrap: at 375 the title, the period pill and the four tabs do not
          fit one line, and without it the last tab is clipped off the card. */}
      <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle min-h-[44px]">
        <span className="w-6 h-6 rounded-md bg-brand/10 grid place-items-center shrink-0">
          <Receipt size={13} className="text-brand" />
        </span>
        <h3 className="text-[13px] font-semibold text-text-primary">Income Statement</h3>
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle mono">
          {entry.copy}
        </span>
        <TimeframeTabs
          className="ml-auto"
          options={PERIODS.map((p) => p.tf)}
          value={tf}
          onChange={setTf}
        />
      </div>

      <div className="flex-1 px-4 py-3">
        {error ? (
          <ChartError />
        ) : isLoading && !fundamentals ? (
          <ChartLoading />
        ) : (
          <>
            <Line
              label="Gross fees"
              value={statement.grossFees}
              hint="What users paid to trade"
            />
            <Line
              label="Paid to HLP, builders & spot deployers"
              value={statement.costOfRevenue}
              hint="Derived: gross fees less protocol revenue"
              deduction
            />
            <Line label="Protocol revenue" value={statement.protocolRevenue} total />

            <div className="grid grid-cols-3 gap-px bg-border-subtle mt-4 rounded-md overflow-hidden">
              {[
                {
                  label: "Gross margin",
                  value: pct(statement.grossMargin),
                  sub: "kept per fee dollar",
                },
                {
                  // Two words on purpose: a single long one cannot wrap, and
                  // "Redistributed" overflows the cell on a narrow card.
                  label: "Paid out",
                  value: pct(
                    statement.grossMargin == null ? null : 1 - statement.grossMargin
                  ),
                  sub: "back to liquidity & flow",
                },
                {
                  label: "Revenue / day",
                  value:
                    statement.revenuePerDay == null
                      ? "—"
                      : compactUsd(statement.revenuePerDay),
                  sub: entry.period === "totalAllTime" ? "n/a since launch" : `avg over ${entry.copy}`,
                },
              ].map((cell) => (
                <div key={cell.label} className="bg-surface px-3 py-2.5">
                  <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">
                    {cell.label}
                  </div>
                  <div className="text-[17px] font-semibold text-text-primary mono mt-1">
                    {cell.value}
                  </div>
                  <div className="text-[10.5px] text-text-tertiary/80 mt-0.5">{cell.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3.5 py-1.5 border-t border-border-subtle text-[10px] text-text-tertiary">
        <span>Source: DefiLlama</span>
        <span className="opacity-50">·</span>
        <span>
          The deduction is derived, not reported: it aggregates every payout and cannot be split
          by recipient from this source.
        </span>
      </div>
    </Card>
  );
});
