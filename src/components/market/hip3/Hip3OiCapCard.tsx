"use client";

import { compactUsd } from "@/lib/formatters/numberFormatting";
import { Hip3AssetView } from "@/services/market/hip3";
import { Hip3Chip, Hip3FactCard } from "./Hip3FactCard";

/**
 * How much of the operator's open-interest cap is in use.
 *
 * A ceiling rather than a measurement: at 100% no new position can open, and
 * the cap is set by the venue operator, not by Hyperliquid.
 *
 * The numerator comes from `oiNotionalUsd()`, never from the raw `openInterest`
 * field — that one is denominated in contracts while the cap is in USD, and
 * comparing them directly understates utilisation by the asset price.
 */
export function Hip3OiCapCard({ view }: { view: Hip3AssetView }) {
  const { oiNotionalUsd, oiCapUsd, oiUtilisation, venue } = view;
  if (oiNotionalUsd === null) return null;

  const pct = oiUtilisation === null ? null : oiUtilisation * 100;
  const fill = pct === null ? "bg-brand" : pct > 90 ? "bg-danger" : pct > 70 ? "bg-gold" : "bg-brand";

  return (
    <Hip3FactCard
      title="Open interest vs cap"
      headAside={
        <Hip3Chip tone="muted">set by {venue?.fullName || venue?.name || "operator"}</Hip3Chip>
      }
      value={pct === null ? "N/A" : `${pct.toFixed(2)}%`}
      qualifier={pct === null ? "no cap published" : "of the operator cap"}
      visual={
        pct === null ? null : (
          <div>
            <div className="flex w-full overflow-hidden rounded-full bg-surface-2 h-1.5">
              <div className={`h-full ${fill}`} style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
            <div className="flex justify-between text-[9.5px] text-text-tertiary mt-1">
              <span>0</span>
              <span>70%</span>
              <span>cap</span>
            </div>
          </div>
        )
      }
      leftLabel={
        <>
          open <span className="mono text-text-secondary">{compactUsd(oiNotionalUsd, { decimals: 0 })}</span>
        </>
      }
      rightLabel={
        oiCapUsd ? (
          <>
            cap <span className="mono text-text-secondary">{compactUsd(oiCapUsd, { decimals: 0 })}</span>
          </>
        ) : null
      }
      context="At the cap, no new position can be opened on this market."
    />
  );
}
