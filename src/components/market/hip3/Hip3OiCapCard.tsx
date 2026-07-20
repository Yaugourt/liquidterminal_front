"use client";

import { Card } from "@/components/ui/card";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { Hip3AssetView } from "@/services/market/hip3";

/**
 * How much of the operator's open-interest cap is in use.
 *
 * Its own card rather than a ribbon tile because it is a ceiling, not a
 * measurement: at 100% no new position can open on this market, and the cap is
 * set by the venue operator, not by Hyperliquid.
 *
 * The numerator comes from `oiNotionalUsd()`, never from the raw `openInterest`
 * field — that one is denominated in contracts while the cap is in USD, and
 * comparing them directly understates utilisation by the asset price.
 */
export function Hip3OiCapCard({ view }: { view: Hip3AssetView }) {
  const { oiNotionalUsd, oiCapUsd, oiUtilisation, venue } = view;
  if (oiNotionalUsd === null) return null;

  const pct = oiUtilisation === null ? null : oiUtilisation * 100;
  const tone = pct === null ? "bg-brand" : pct > 90 ? "bg-danger" : pct > 70 ? "bg-gold" : "bg-brand";

  return (
    <Card className="flex flex-col">
      <div className="flex items-baseline gap-2 px-4 py-2.5 border-b border-border-subtle">
        <h3 className="text-[13px] font-medium text-text-primary truncate">Open interest vs cap</h3>
        <span className="ml-auto shrink-0 text-[11px] text-text-tertiary">
          set by {venue?.fullName || venue?.name || "the operator"}
        </span>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-baseline gap-2">
          <span className="mono text-[26px] font-medium leading-none text-text-primary">
            {pct === null ? "N/A" : `${pct.toFixed(2)}%`}
          </span>
          <span className="text-[11px] text-text-tertiary">
            {pct === null ? "no cap published" : "of the operator cap"}
          </span>
        </div>

        {pct !== null && (
          <div className="flex w-full overflow-hidden rounded-full bg-surface-2 mt-3 h-2">
            <div className={`h-full ${tone}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        )}

        <div className="flex justify-between text-[11px] text-text-tertiary mt-1.5">
          <span className="mono">{compactUsd(oiNotionalUsd, { decimals: 0 })} open</span>
          {oiCapUsd ? (
            <span className="mono">{compactUsd(oiCapUsd, { decimals: 0 })} cap</span>
          ) : null}
        </div>
      </div>

      <div className="px-4 py-2 border-t border-border-subtle text-[11px] text-text-tertiary">
        At the cap, no new position can be opened on this market.
      </div>
    </Card>
  );
}
