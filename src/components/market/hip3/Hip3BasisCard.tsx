"use client";

import { formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useHip3Underlying } from "@/services/market/hip3/underlying";
import { Hip3Chip, Hip3FactRow } from "./Hip3FactCard";

/** Narrowest span the gauge shows either side of zero. */
const GAUGE_MIN_BPS = 50;

/**
 * Gauge span, either side of zero. Fixed at ±50 bps the needle pins to the edge
 * the moment a market gaps — and gapping is exactly when this matters, so the
 * scale grows to keep the reading inside it.
 */
function gaugeRange(basisBps: number): number {
  return Math.max(GAUGE_MIN_BPS, Math.ceil((Math.abs(basisBps) * 1.25) / 25) * 25);
}

/**
 * The synthetic against the instrument it tracks — the only independent check
 * on an oracle the venue operator runs.
 *
 * Absent on roughly three quarters of HIP-3 markets: private companies, pre-IPO
 * names and house baskets have no listed counterpart, and non-US listings sit
 * outside the data plan. The row then does not render, and the block is one row
 * shorter.
 */
export function Hip3BasisCard({
  coin,
  markPx,
  ticker,
}: {
  coin: string;
  markPx: number | null;
  ticker: string;
}) {
  const { format } = useNumberFormat();
  const { quote, unavailable, basisBps, impliedGapPercent, marketOpen, isLoading } =
    useHip3Underlying(coin, markPx);

  // No listed counterpart, or outside the data plan: no row. Silence beats an
  // error for something that is not broken.
  if (unavailable || (isLoading && !quote) || !quote) return null;

  // Real session state when the exchange publishes one. Falls back to "closed"
  // only for instruments with no cash calendar to consult.
  const closed = marketOpen === null ? false : !marketOpen;
  const showState = marketOpen !== null;
  const range = basisBps === null ? GAUGE_MIN_BPS : gaugeRange(basisBps);
  const offset = basisBps === null ? null : basisBps / (range * 2);

  const prices = (
    <>
      synth{" "}
      <span className="mono text-text-secondary">
        {markPx === null ? "N/A" : formatPrice(markPx, format)}
      </span>{" "}
      vs real <span className="mono text-text-secondary">{formatPrice(quote.price, format)}</span>
    </>
  );

  return (
    <Hip3FactRow
      subject={`Versus real ${quote.symbol}`}
      value={
        basisBps === null
          ? "—"
          : `${basisBps >= 0 ? "+" : "−"}${Math.abs(basisBps).toFixed(1)}`
      }
      unit={basisBps === null ? undefined : "bps"}
      meter={
        offset === null ? undefined : (
          <div
            className="relative h-[3px] rounded-full bg-surface-2"
            title={`synthetic below real ← 0 → synthetic above real · ±${range} bps`}
          >
            <div className="absolute inset-y-[-2px] left-1/2 w-px bg-border-strong" />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-[3px] h-[9px] rounded-sm bg-brand"
              style={{ left: `${(0.5 + offset) * 100}%` }}
            />
          </div>
        )
      }
      clause={
        basisBps === null ? (
          <>not comparable — {quote.basisNote ?? "mapping not confirmed"}, so no basis is published</>
        ) : closed ? (
          <>
            {prices} — {quote.market} is closed, so this is the{" "}
            <span className="text-text-secondary">move priced for reopening</span>
          </>
        ) : (
          <>
            {prices} — {ticker} is trading{" "}
            <span className={impliedGapPercent! >= 0 ? "text-success" : "text-danger"}>
              {Math.abs(impliedGapPercent!).toFixed(2)}% {impliedGapPercent! >= 0 ? "above" : "below"}
            </span>{" "}
            the live market
          </>
        )
      }
      aside={
        <Hip3Chip tone={!showState ? "muted" : closed ? "muted" : "success"}>
          {showState ? (
            <span
              className={`w-1.5 h-1.5 rounded-full ${closed ? "bg-text-tertiary" : "bg-success"}`}
            />
          ) : null}
          {quote.market}
          {showState ? (closed ? " closed" : " open") : ""}
        </Hip3Chip>
      }
    />
  );
}
