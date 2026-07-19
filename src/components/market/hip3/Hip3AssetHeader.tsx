"use client";

import Link from "next/link";
import { TokenAvatar } from "@/components/common";
import { formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { Hip3AssetView } from "@/services/market/hip3";

/**
 * Identity and headline price, on a single line.
 *
 * Unboxed on purpose: wrapped in a Card it read as a second stat band stacked
 * on the ribbon, which is the shape the design system reserves for `KpiRibbon`.
 * The venue rides as a chip beside the name rather than a sentence underneath,
 * which is what kept the block tall.
 *
 * No `<h1>` — the route layout already emits the sr-only heading.
 */
export function Hip3AssetHeader({ view }: { view: Hip3AssetView }) {
  const { format } = useNumberFormat();
  const { asset, venue, ticker, status } = view;
  if (!asset) return null;

  const live = status === "live";
  const venueLabel = venue?.fullName || venue?.name || view.dexId.toUpperCase();
  const change = asset.priceChange24h;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <TokenAvatar assetName={asset.coin} size="md" />

      <div className="flex items-center gap-2 flex-wrap min-w-0">
        <span className="font-inter text-xl font-semibold text-text-primary tracking-tight">
          {ticker}
          <span className="text-sm font-normal text-text-tertiary tracking-normal">
            {" "}
            / {asset.collateralToken}
          </span>
        </span>

        <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-brand/10 border border-brand/25 text-brand font-medium">
          HIP-3
        </span>

        <span className="text-text-tertiary text-[11px]">·</span>
        <Link
          href={`/market/perpdex/${view.dexId}`}
          className="text-[11.5px] text-text-secondary hover:text-brand transition-colors"
        >
          {venueLabel}
        </Link>

        <span className="text-text-tertiary text-[11px]">·</span>
        {live ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-success font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Live
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-text-tertiary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
            {status === "delisted" ? "Delisted" : "No live data"}
          </span>
        )}
      </div>

      <div className="ml-auto flex items-baseline gap-3 shrink-0">
        <span className="mono text-[24px] font-medium tracking-[-0.02em] leading-none text-text-primary">
          {formatPrice(asset.markPx, format)}
        </span>
        <span
          className={`mono text-[15px] font-medium leading-none ${
            change === null ? "text-text-tertiary" : change >= 0 ? "text-success" : "text-danger"
          }`}
        >
          {change === null ? "N/A" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}
        </span>
      </div>
    </div>
  );
}
