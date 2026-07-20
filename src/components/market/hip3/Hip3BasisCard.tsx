"use client";

import { formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useHip3Underlying } from "@/services/market/hip3/underlying";
import { Hip3Chip, Hip3FactCard } from "./Hip3FactCard";

/** Narrowest span the gauge shows either side of zero. */
const GAUGE_MIN_BPS = 50;

/**
 * Gauge span, either side of zero. Fixed at ±50 bps the needle pins to the edge
 * the moment a market gaps — and gapping is exactly when this card matters, so
 * the scale grows to keep the reading inside it.
 */
function gaugeRange(basisBps: number): number {
  return Math.max(GAUGE_MIN_BPS, Math.ceil((Math.abs(basisBps) * 1.25) / 25) * 25);
}

/**
 * The synthetic against the instrument it tracks — the only independent check
 * on an oracle the venue operator runs.
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

  // No listed counterpart, or outside the data plan: no card. Silence beats an
  // error for something that is not broken.
  if (unavailable || (isLoading && !quote) || !quote) return null;

  // Real session state when the exchange publishes one. Falls back to "closed"
  // only for instruments with no cash calendar to consult.
  const closed = marketOpen === null ? false : !marketOpen;
  const showState = marketOpen !== null;
  const range = basisBps === null ? GAUGE_MIN_BPS : gaugeRange(basisBps);
  const offset = basisBps === null ? null : basisBps / (range * 2);

  return (
    <Hip3FactCard
      title={`Versus real ${quote.symbol}`}
      headAside={
        <Hip3Chip tone={!showState ? "muted" : closed ? "muted" : "success"}>
          {showState ? (
            <span className={`w-1.5 h-1.5 rounded-full ${closed ? "bg-text-tertiary" : "bg-success"}`} />
          ) : null}
          {quote.market}
          {showState ? (closed ? " closed" : " open") : ""}
        </Hip3Chip>
      }
      value={
        basisBps === null
          ? "—"
          : `${basisBps >= 0 ? "+" : "−"}${Math.abs(basisBps).toFixed(1)}`
      }
      unit={basisBps === null ? undefined : "bps"}
      qualifier={basisBps === null ? "not comparable" : "synthetic vs real"}
      visual={
        offset === null ? null : (
          <div>
            <div className="relative h-1.5 w-full rounded-full bg-surface-2">
              <div className="absolute inset-y-0 left-1/2 w-px bg-border-strong" />
              <div
                className="absolute inset-y-0 w-1 rounded-full bg-brand"
                style={{ left: `${(0.5 + offset) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[9.5px] text-text-tertiary mt-1">
              <span>−{range}bp</span>
              <span>0</span>
              <span>+{range}bp</span>
            </div>
          </div>
        )
      }
      leftLabel={
        <>
          real <span className="mono text-text-secondary">{formatPrice(quote.price, format)}</span>
        </>
      }
      rightLabel={
        <>
          synth{" "}
          <span className="mono text-text-secondary">
            {markPx === null ? "N/A" : formatPrice(markPx, format)}
          </span>
        </>
      }
      context={
        basisBps === null ? (
          <>Basis hidden — {quote.basisNote ?? "mapping not confirmed"}.</>
        ) : closed ? (
          <>
            {quote.market} is closed: this gap is the{" "}
            <span className="text-text-secondary">move priced for reopening</span>.
          </>
        ) : (
          <>
            {ticker} is tracking the live market{" "}
            <span className={impliedGapPercent! >= 0 ? "text-success" : "text-danger"}>
              {impliedGapPercent! >= 0 ? "+" : ""}
              {impliedGapPercent!.toFixed(2)}%
            </span>{" "}
            away.
          </>
        )
      }
    />
  );
}
