"use client";

import Link from "next/link";
import { TokenAvatar } from "@/components/common";
import { Card } from "@/components/ui/card";
import { compactUsd, formatFunding, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { Hip3AssetView } from "@/services/market/hip3";

/**
 * Identity strip for a HIP-3 market.
 *
 * Deliberately NOT a third branch of `TokenCard`: that component is shared by
 * the spot and perp token pages, predates the V4 design system (w-fit +
 * flex-wrap, no KpiRibbon, no Num), and adding a case to it would put two
 * high-traffic pages at risk for a cosmetic gain. This is composed from design
 * kit blocks instead, so it is DS-correct from the start.
 */
export function Hip3AssetHeader({ view }: { view: Hip3AssetView }) {
  const { format } = useNumberFormat();
  const { asset, venue, ticker, status, oracleDeviationBps, impactSpreadBps } = view;
  if (!asset) return null;

  const live = status === "live";
  const venueLabel = venue?.fullName || venue?.name || view.dexId.toUpperCase();

  return (
    <Card className="px-5 py-4">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex items-center gap-3 min-w-0">
          <TokenAvatar assetName={asset.coin} size="lg" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-semibold text-text-primary tracking-tight">
                {ticker} / {asset.collateralToken}
              </span>
              <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-brand/10 border border-brand/25 text-brand font-medium">
                HIP-3
              </span>
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

        <HeaderStat label="Mark" value={formatPrice(asset.markPx, format)} sub={asset.midPx ? `mid ${formatPrice(asset.midPx, format)}` : undefined} />
        <HeaderStat label="Oracle" value={formatPrice(asset.oraclePx, format)} sub="operator-run" />
        <HeaderStat
          label="Δ mark−oracle"
          value={oracleDeviationBps === null ? "N/A" : `${oracleDeviationBps >= 0 ? "+" : ""}${oracleDeviationBps.toFixed(1)} bps`}
          sub={impactSpreadBps === null ? undefined : `impact spread ${impactSpreadBps.toFixed(1)} bps`}
        />
        <HeaderStat
          label="24h change"
          value={asset.priceChange24h === null ? "N/A" : `${asset.priceChange24h >= 0 ? "+" : ""}${asset.priceChange24h.toFixed(2)}%`}
          tone={asset.priceChange24h === null ? undefined : asset.priceChange24h >= 0 ? "success" : "danger"}
          sub={asset.prevDayPx ? `prev ${formatPrice(asset.prevDayPx, format)}` : undefined}
        />
        <HeaderStat label="24h volume" value={compactUsd(asset.dayNtlVlm)} />
        <HeaderStat
          label="Funding · 1h"
          value={asset.funding === null ? "N/A" : formatFunding(asset.funding)}
          sub={asset.premium === null ? undefined : `premium ${(asset.premium * 10_000).toFixed(1)} bps`}
        />

        <div className="ml-auto shrink-0">
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
      </div>
    </Card>
  );
}

function HeaderStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "success" | "danger";
}) {
  const toneClass =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-text-primary";
  return (
    <div className="flex flex-col">
      <div className="text-[10px] uppercase tracking-[0.08em] text-text-tertiary">{label}</div>
      <div className={`mono text-[22px] font-medium tracking-[-0.01em] leading-none mt-2 ${toneClass}`}>
        {value}
      </div>
      {sub ? <div className="text-[10.5px] text-text-tertiary mt-1.5">{sub}</div> : null}
    </div>
  );
}
