"use client";

import { KpiRibbon, KpiCell } from "@/components/common";
import { compactUsd, formatFunding, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { Hip3AssetView } from "@/services/market/hip3";
import type { Hip3Snapshot } from "@/services/indexer/hip3";

/**
 * The single stat band for a HIP-3 market.
 *
 * "Single" is the point: the header used to carry a second, hand-rolled strip,
 * which restated 24h volume verbatim. The design system makes this component
 * the only horizontal stat strip, so everything measurable lives here and the
 * header keeps only identity plus the headline price.
 *
 * Three fields are intentionally absent because they are already on screen:
 * collateral is in the pair name (`CL / USDC`), the venue's market count is in
 * the venue card header, and executable spread is in the order book.
 *
 * No sparkline on any cell — no metric here has a usable per-asset history
 * (HypeDexer's OHLCV and oracle series are collapsed by an upstream
 * `asset_id = 0`), and the system forbids inventing one.
 */
export function Hip3AssetKpiRibbon({
  view,
  snapshot,
}: {
  view: Hip3AssetView;
  /** HypeDexer totals. Null when the proxy is down — the ribbon just shortens. */
  snapshot?: Hip3Snapshot | null;
}) {
  const { format } = useNumberFormat();
  const { asset, venue, oiNotionalUsd, oiCapUsd, oiUtilisation, oracleDeviationBps } = view;
  if (!asset) return null;

  const cells: KpiCell[] = [];

  // On HIP-3 the oracle is run by the venue operator, not by Hyperliquid, so
  // its gap to the mark is the market's trust signal. Point-in-time only.
  cells.push({
    key: "oracle",
    label: "Δ mark−oracle",
    value:
      oracleDeviationBps === null
        ? "N/A"
        : `${oracleDeviationBps >= 0 ? "+" : ""}${oracleDeviationBps.toFixed(1)} bps`,
    sub: `oracle ${formatPrice(asset.oraclePx, format)}`,
  });

  cells.push({
    key: "funding",
    label: "Funding · 1h",
    value: asset.funding === null ? "N/A" : formatFunding(asset.funding),
    sub:
      asset.premium === null
        ? undefined
        : `premium ${(asset.premium * 10_000).toFixed(1)} bps`,
  });

  // OI is compared against the cap in USD on BOTH sides — the raw
  // `openInterest` field is in contracts, and mixing the two understates
  // utilisation by the asset price (a factor of ~84 on xyz:CL).
  cells.push({
    key: "oi",
    label: "OI / cap",
    value: oiUtilisation === null ? "N/A" : `${(oiUtilisation * 100).toFixed(2)}%`,
    // Zero decimals here on purpose: two full `$147.95M`-style figures plus a
    // separator overflow the cell and wrap, which stretches the whole ribbon.
    sub:
      oiNotionalUsd === null
        ? undefined
        : oiCapUsd
          ? `${compactUsd(oiNotionalUsd, { decimals: 0 })} of ${compactUsd(oiCapUsd, { decimals: 0 })}`
          : `${compactUsd(oiNotionalUsd, { decimals: 0 })} open`,
  });

  cells.push({
    key: "vol24",
    label: "24h volume",
    value: compactUsd(asset.dayNtlVlm),
    sub: `${asset.dayBaseVlm.toLocaleString(undefined, { maximumFractionDigits: 0 })} ${asset.ticker}`,
  });

  cells.push({
    key: "leverage",
    label: "Max leverage",
    // Hyperliquid is the only trustworthy source: the HypeDexer asset endpoint
    // reports a flat 5x for every market, which is wrong.
    value: `${asset.maxLeverage}x`,
    sub: asset.growthMode === "enabled" ? "growth mode on" : undefined,
  });

  if (venue) {
    cells.push({
      key: "fee-share",
      label: "Fee share",
      value: venue.deployerFeeScale.toFixed(2),
      sub: `to ${venue.fullName || venue.name}`,
      tone: "gold",
    });
  }

  // Cumulative totals are the only history this market exposes. Appended, not
  // interleaved, so the ribbon keeps its shape when the proxy answers 402.
  if (snapshot) {
    cells.push({
      key: "vol-cumulative",
      label: "Total volume",
      value: compactUsd(snapshot.total_volume_cumulative),
      sub: "since listing",
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
