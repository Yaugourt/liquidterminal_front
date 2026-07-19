"use client";

import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { useHip3Underlying } from "@/services/market/hip3/underlying";

/**
 * The real instrument the synthetic tracks, and the gap between them.
 *
 * This is the only independent check on a HIP-3 oracle available anywhere: the
 * venue operator sets the oracle, and this compares it against a market data
 * provider with no stake in the venue.
 *
 * The gap means different things depending on the hour. While the cash market
 * trades, it is a live tracking error. While it is shut — nights, weekends,
 * which is most of the time a 24/7 perp is open — it is the reopening gap the
 * synthetic is pricing in, and it is the risk anyone holding over a weekend
 * carries whether they know it or not.
 */
export function Hip3UnderlyingCard({
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

  // A market with no listed counterpart (private, pre-IPO, house basket) or one
  // outside the current data plan simply has no card. Silence beats an error
  // for something that is not broken.
  if (unavailable === "unmapped" || unavailable === "plan" || unavailable === "unconfigured") {
    return null;
  }
  if (isLoading && !quote) return null;
  if (!quote) return null;

  const stale = quote.quotedAt ? Date.now() - quote.quotedAt > 6 * 3600_000 : false;

  return (
    <Card className="flex flex-col">
      <div className="flex items-baseline gap-2 px-4 py-3 border-b border-border-subtle">
        <h3 className="text-[13px] font-medium text-text-primary truncate">
          Underlying · {quote.symbol}
        </h3>
        <span className="ml-auto shrink-0 text-[11px] text-text-tertiary">{quote.market}</span>
      </div>

      <div className="px-4 py-3 grid grid-cols-2 gap-y-3 border-b border-border-subtle">
        <Stat
          label={stale ? "Last close" : "Real price"}
          value={formatPrice(quote.price, format)}
        />
        <Stat
          label="Session"
          value={
            quote.changePercent === null
              ? "N/A"
              : `${quote.changePercent >= 0 ? "+" : ""}${quote.changePercent.toFixed(2)}%`
          }
          tone={
            quote.changePercent === null
              ? undefined
              : quote.changePercent >= 0
                ? "success"
                : "danger"
          }
        />
        <Stat
          label="Synthetic mark"
          value={markPx === null ? "N/A" : formatPrice(markPx, format)}
        />
        <Stat
          label="Basis"
          value={
            basisBps === null
              ? "—"
              : `${basisBps >= 0 ? "+" : ""}${basisBps.toFixed(1)} bps`
          }
        />
      </div>

      <div className="px-4 py-2.5 text-[11px] text-text-tertiary">
        {basisBps === null ? (
          // Suppressed rather than shown: the synthetic tracks a different
          // contract, so any figure here would read as a mispricing that is
          // really a mapping artefact.
          <span>
            Basis not shown — {quote.basisNote ?? "mapping not confirmed for this instrument"}.
          </span>
        ) : (
          <span>
            {ticker} synthetic is trading{" "}
            <span className={impliedGapPercent! >= 0 ? "text-success" : "text-danger"}>
              {impliedGapPercent! >= 0 ? "+" : ""}
              {impliedGapPercent!.toFixed(2)}%
            </span>{" "}
            {stale ? "versus the last close — the gap priced for reopening." : "versus the live market."}
          </span>
        )}
      </div>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "danger";
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-text-primary";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">{label}</div>
      <div className={`mono text-[18px] font-medium leading-none mt-1.5 ${toneClass}`}>{value}</div>
    </div>
  );
}
