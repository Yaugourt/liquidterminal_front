"use client";

import { KpiRibbon, KpiCell } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { Hip3AssetView } from "@/services/market/hip3";

/**
 * The six figures that separate a HIP-3 perp from a native one: how much of the
 * operator's OI cap is used, what leverage and fee share the operator set, and
 * what collateral backs it.
 *
 * No sparkline on any cell — none of these metrics has a usable per-asset
 * history (HypeDexer's OHLCV and oracle series are collapsed by an upstream
 * `asset_id = 0`), and the DS forbids inventing one.
 */
export function Hip3AssetKpiRibbon({ view }: { view: Hip3AssetView }) {
  const { asset, venue, oiNotionalUsd, oiCapUsd, oiUtilisation } = view;
  if (!asset) return null;

  const cells: KpiCell[] = [];

  // OI is compared against the cap in USD on BOTH sides — the raw
  // `openInterest` field is in contracts, and mixing the two understates
  // utilisation by the asset price (a factor of ~84 on xyz:CL).
  cells.push({
    key: "oi",
    label: "OI / operator cap",
    value: oiUtilisation === null ? "N/A" : `${(oiUtilisation * 100).toFixed(2)}%`,
    sub:
      oiNotionalUsd === null
        ? undefined
        : oiCapUsd
          ? `${compactUsd(oiNotionalUsd)} / ${compactUsd(oiCapUsd)}`
          : `${compactUsd(oiNotionalUsd)} open`,
  });

  cells.push({
    key: "leverage",
    label: "Max leverage",
    // Hyperliquid is the only trustworthy source here: the HypeDexer asset
    // endpoint reports a flat 5x for every market, which is wrong.
    value: `${asset.maxLeverage}x`,
  });

  if (venue) {
    cells.push({
      key: "fee-share",
      label: "Fee share",
      value: `${venue.deployerFeeScale.toFixed(2)}`,
      sub: `to ${venue.fullName || venue.name}`,
      tone: "gold",
    });
  }

  cells.push({
    key: "collateral",
    label: "Collateral",
    value: asset.collateralToken,
    sub: asset.growthMode === "enabled" ? "growth mode on" : undefined,
  });

  cells.push({
    key: "vol24",
    label: "24h volume",
    value: compactUsd(asset.dayNtlVlm),
    sub: `${asset.dayBaseVlm.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${asset.ticker}`,
  });

  cells.push({
    key: "markets",
    label: "Markets on venue",
    value: `${view.liveCount}`,
    sub: `of ${view.totalCount} listed`,
  });

  return <KpiRibbon variant="plain" cells={cells} />;
}
