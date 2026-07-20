"use client";

import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useHip3Underlying } from "@/services/market/hip3/underlying";

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
 * The synthetic against the instrument it tracks.
 *
 * Promoted out of the bottom rail: on a HIP-3 market the oracle is run by the
 * venue operator, so an independent price is the single most load-bearing fact
 * on the page — and it was sitting under two full-height sections where nobody
 * scrolled.
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
  const { quote, unavailable, basisBps, impliedGapPercent, isLoading } = useHip3Underlying(
    coin,
    markPx
  );

  // No listed counterpart, or outside the data plan: no card. Silence beats an
  // error for something that is not broken.
  if (unavailable || (isLoading && !quote) || !quote) return null;

  const stale = quote.quotedAt ? Date.now() - quote.quotedAt > 6 * 3600_000 : false;
  const range = basisBps === null ? GAUGE_MIN_BPS : gaugeRange(basisBps);
  const offset = basisBps === null ? null : basisBps / (range * 2);

  return (
    <Card className="flex flex-col">
      <div className="flex items-baseline gap-2 px-4 py-2.5 border-b border-border-subtle">
        <h3 className="text-[13px] font-medium text-text-primary truncate">
          Versus real {quote.symbol}
        </h3>
        <span className="ml-auto shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-surface-2 border border-border-subtle text-text-tertiary">
          {quote.market} {stale ? "closed" : "open"}
        </span>
      </div>

      <div className="px-4 py-3 flex items-end gap-5">
        <div className="shrink-0">
          <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">Basis</div>
          <div className="mono text-[26px] font-medium leading-none mt-1.5 text-text-primary">
            {basisBps === null ? (
              "—"
            ) : (
              <>
                {basisBps >= 0 ? "+" : "−"}
                {Math.abs(basisBps).toFixed(1)}{" "}
                <span className="text-[14px] text-text-tertiary">bps</span>
              </>
            )}
          </div>
        </div>

        {offset !== null && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] text-text-tertiary">
              <span>
                real <span className="mono text-text-secondary">{formatPrice(quote.price, format)}</span>
              </span>
              <span>
                synth{" "}
                <span className="mono text-text-secondary">
                  {markPx === null ? "N/A" : formatPrice(markPx, format)}
                </span>
              </span>
            </div>
            <div className="relative h-1.5 w-full rounded-full bg-surface-2 mt-2">
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
        )}
      </div>

      <div className="px-4 py-2 border-t border-border-subtle text-[11px] text-text-tertiary">
        {basisBps === null ? (
          <>Basis not shown — {quote.basisNote ?? "mapping not confirmed for this instrument"}.</>
        ) : stale ? (
          <>
            {quote.market} is closed: this gap is the{" "}
            <span className="text-text-secondary">move priced for reopening</span>, not a tracking
            error.
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
        )}
      </div>
    </Card>
  );
}
