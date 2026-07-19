"use client";

import Link from "next/link";
import { TokenAvatar } from "@/components/common";
import { Card } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { Hip3AssetView } from "@/services/market/hip3";

/**
 * Identity and headline price for a HIP-3 market.
 *
 * Carries no stat strip of its own: the design system makes `KpiRibbon` the
 * single horizontal stat band, and running two of them stacked duplicated 24h
 * volume verbatim. Everything measurable lives in the ribbon below; this card
 * answers "what am I looking at, and at what price".
 *
 * Deliberately not a third branch of `TokenCard`: that component is shared by
 * the spot and perp pages and predates the V4 system.
 */
export function Hip3AssetHeader({ view }: { view: Hip3AssetView }) {
  const { format } = useNumberFormat();
  const { asset, venue, ticker, status } = view;
  if (!asset) return null;

  const live = status === "live";
  const venueLabel = venue?.fullName || venue?.name || view.dexId.toUpperCase();
  const change = asset.priceChange24h;

  return (
    <Card className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <div className="flex items-center gap-3 min-w-0">
          <TokenAvatar assetName={asset.coin} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[17px] font-semibold text-text-primary tracking-tight">
                {ticker} / {asset.collateralToken}
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
            <div className="text-[11.5px] text-text-tertiary mt-0.5">
              deployed by{" "}
              <Link
                href={`/market/perpdex/${view.dexId}`}
                className="text-text-secondary hover:text-brand transition-colors"
              >
                {venueLabel}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-end gap-6 shrink-0">
          <div className="flex flex-col">
            <div className="mono text-[28px] font-medium tracking-[-0.02em] leading-none text-text-primary">
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
    </Card>
  );
}
