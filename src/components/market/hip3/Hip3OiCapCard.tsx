"use client";

import { compactUsd } from "@/lib/formatters/numberFormatting";
import { Hip3AssetView } from "@/services/market/hip3";
import { Hip3Chip, Hip3FactRow } from "./Hip3FactCard";

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
    <Hip3FactRow
      subject="Open interest vs cap"
      value={pct === null ? "N/A" : pct.toFixed(2)}
      unit={pct === null ? undefined : "%"}
      meter={
        pct === null ? undefined : (
          <div
            className="flex w-full overflow-hidden rounded-full bg-surface-2 h-[3px]"
            title={`${compactUsd(oiNotionalUsd, { decimals: 0 })} of the ${
              oiCapUsd ? compactUsd(oiCapUsd, { decimals: 0 }) : "published"
            } ceiling`}
          >
            <div className={`h-full ${fill}`} style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
        )
      }
      clause={
        <>
          <span className="mono text-text-secondary">
            {compactUsd(oiNotionalUsd, { decimals: 0 })}
          </span>{" "}
          open
          {oiCapUsd ? (
            <>
              {" "}
              of the{" "}
              <span className="mono text-text-secondary">
                {compactUsd(oiCapUsd, { decimals: 0 })}
              </span>{" "}
              ceiling — at the cap, no new position can open
            </>
          ) : (
            <> — no ceiling published for this market</>
          )}
        </>
      }
      aside={
        oiCapUsd ? (
          <Hip3Chip tone="muted">cap set by {venue?.fullName || venue?.name || "operator"}</Hip3Chip>
        ) : undefined
      }
    />
  );
}
