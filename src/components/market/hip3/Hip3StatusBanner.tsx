"use client";

import { Hip3AssetStatus } from "@/services/market/hip3";

/**
 * Lifecycle warning for a HIP-3 market.
 *
 * Renders nothing for a live market. It exists because roughly half of the
 * listed HIP-3 assets are delisted (117 of 231 at the time of writing, with 5
 * of the 9 DEXes holding no live market at all). On those, `candleSnapshot`
 * returns an empty array and there is no WS traffic — without this banner the
 * page would show a frozen last price with nothing telling the reader it is
 * frozen.
 */
export function Hip3StatusBanner({
  status,
  venueName,
}: {
  status: Hip3AssetStatus;
  venueName?: string;
}) {
  if (status === "live") return null;

  const venue = venueName ?? "this venue";
  const message =
    status === "delisted"
      ? `This market is delisted. Trading has stopped on ${venue}.`
      : `This market is not reporting live data on ${venue}.`;

  return (
    <div className="rounded-lg border border-gold/25 bg-gold/5 px-4 py-3 flex items-start gap-3">
      <span aria-hidden="true" className="text-gold text-[13px] leading-none mt-0.5">
        !
      </span>
      <div className="min-w-0">
        <div className="text-[12.5px] font-medium text-gold">{message}</div>
        <div className="text-[11.5px] text-text-secondary mt-0.5">
          Figures below are the last recorded state, not live prices.
        </div>
      </div>
    </div>
  );
}
