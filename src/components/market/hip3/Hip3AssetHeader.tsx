"use client";

import Link from "next/link";
import { TokenAvatar } from "@/components/common";
import { formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { Hip3AssetView } from "@/services/market/hip3";

/**
 * Identity and headline price for a HIP-3 market.
 *
 * Rendered as a page-header line rather than a card: boxed, it read as a second
 * stat band stacked on the ribbon below, which is exactly the shape the design
 * system reserves for `KpiRibbon`. Unboxed, the page has one bordered band and
 * this reads as the title it is.
 *
 * No `<h1>` here — the route layout already emits the sr-only heading, and a
 * second one would compete with it.
 */
export function Hip3AssetHeader({ view }: { view: Hip3AssetView }) {
  const { format } = useNumberFormat();
  const { asset, venue, ticker, status } = view;
  if (!asset) return null;

  const live = status === "live";
  const venueLabel = venue?.fullName || venue?.name || view.dexId.toUpperCase();
  const change = asset.priceChange24h;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <TokenAvatar assetName={asset.coin} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-inter text-2xl font-semibold text-text-primary tracking-tight">
              {ticker}
              <span className="text-base font-normal text-text-tertiary tracking-normal">
                {" "}
                / {asset.collateralToken}
              </span>
            </span>
            <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-brand/10 border border-brand/25 text-brand font-medium">
              HIP-3
            </span>
            {live ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md bg-success/10 border border-success/25 text-success font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md bg-surface-2 border border-border-subtle text-text-tertiary font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                {status === "delisted" ? "Delisted" : "No live data"}
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Synthetic perp deployed by{" "}
            <Link
              href={`/market/perpdex/${view.dexId}`}
              className="text-text-secondary hover:text-brand transition-colors underline decoration-border-default underline-offset-2"
            >
              {venueLabel}
            </Link>
          </p>
        </div>
      </div>

      <div className="flex items-end gap-5 sm:shrink-0">
        <div className="flex flex-col">
          <div className="mono text-[30px] font-medium tracking-[-0.02em] leading-none text-text-primary">
            {formatPrice(asset.markPx, format)}
          </div>
          {asset.midPx ? (
            <div className="text-[10.5px] text-text-tertiary mt-1.5">
              mid <span className="mono">{formatPrice(asset.midPx, format)}</span>
            </div>
          ) : null}
        </div>
        <div className="flex flex-col">
          <div
            className={`mono text-[20px] font-medium tracking-[-0.01em] leading-none ${
              change === null ? "text-text-tertiary" : change >= 0 ? "text-success" : "text-danger"
            }`}
          >
            {change === null ? "N/A" : `${change >= 0 ? "+" : ""}${change.toFixed(2)}%`}
          </div>
          {asset.prevDayPx ? (
            <div className="text-[10.5px] text-text-tertiary mt-1.5">
              prev <span className="mono">{formatPrice(asset.prevDayPx, format)}</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
