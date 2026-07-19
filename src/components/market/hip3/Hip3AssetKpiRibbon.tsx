"use client";

import { KpiRibbon, KpiCell } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { Hip3AssetView } from "@/services/market/hip3";
import type { Hip3Snapshot } from "@/services/indexer/hip3";

/**
 * The six figures that separate a HIP-3 perp from a native one: how much of the
 * operator's OI cap is used, what leverage and fee share the operator set, and
 * what collateral backs it.
 *
 * No sparkline on any cell — none of these metrics has a usable per-asset
 * history (HypeDexer's OHLCV and oracle series are collapsed by an upstream
 * `asset_id = 0`), and the DS forbids inventing one.
 */
export function Hip3AssetKpiRibbon({
  view,
  snapshot,
}: {
  view: Hip3AssetView;
  /** HypeDexer totals. Null when the proxy is down — the ribbon just shortens. */
  snapshot?: Hip3Snapshot | null;
}) {
  const { asset, venue, oiNotionalUsd, oiCapUsd, oiUtilisation } = view;
  if (!asset) return null;

  const cells: KpiCell[] = [];

  // OI is compared against the cap in USD on BOTH sides — the raw
  // `openInterest` field is in contracts, and mixing the two understates
  // utilisation by the asset price (a factor of ~84 on xyz:CL).
  cells.push({
    key: "oi",
    label: "OI / cap",
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
    label: "Markets",
    value: `${view.liveCount}`,
    sub: `of ${view.totalCount} listed`,
  });

  // Cumulative totals are the only history this market exposes — the per-asset
  // time series upstream is unusable. Appended, not interleaved, so the ribbon
  // keeps its shape when the proxy answers 402.
  if (snapshot) {
    cells.push({
      key: "vol-cumulative",
      label: "Total volume",
      value: compactUsd(snapshot.total_volume_cumulative),
      sub: "cumulative",
    });
    cells.push({
      key: "fees-cumulative",
      label: "Total fees",
      value: compactUsd(snapshot.total_fees_cumulative),
      sub: `${compactUsd(snapshot.fees_24h)} in 24h`,
      tone: "gold",
    });
  }

  return <KpiRibbon variant="plain" cells={cells} />;
}
