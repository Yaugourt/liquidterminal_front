"use client";

import { memo } from "react";
import { KpiRibbon, HypeMark } from "@/components/common";
import type { KpiCell } from "@/components/common";
import { useHypeOverview, useHypeLivePrice, useHypeDayVolume } from "@/services/market/hype";
import { useRevenueBreakdown } from "@/services/market/revenue";
import { formatPrice, compactHype } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { fmtUsd, fmtSignedPct, fmtPct } from "./format";

/**
 * HypeHeroRibbon — the headline KPI strip: price, 24h volume, market cap, FDV,
 * circulating supply, Assistance-Fund value and lifetime protocol revenue. All
 * values are derived from the live on-chain overview (price and volume off the
 * HYPE socket); lifetime revenue is read off the (window-stable) revenue
 * breakdown.
 */
export const HypeHeroRibbon = memo(function HypeHeroRibbon() {
  const { overview } = useHypeOverview();
  const livePrice = useHypeLivePrice();
  const volume = useHypeDayVolume();
  const { format } = useNumberFormat();
  const { breakdown } = useRevenueBreakdown("7d");

  const price = livePrice && livePrice > 0 ? livePrice : overview?.price ?? null;
  const change = overview?.change24hPct ?? null;
  const lifetimeRevenue = breakdown?.lifetime?.total ?? null;

  const changeNode =
    change == null ? (
      <span className="text-text-tertiary">—</span>
    ) : (
      <span className={change >= 0 ? "text-success" : "text-danger"}>
        {fmtSignedPct(change)} 24h
      </span>
    );

  const cells: KpiCell[] = [
    {
      key: "price",
      label: "Price",
      value: price != null ? formatPrice(price, format) : "—",
      sub: changeNode,
    },
    {
      key: "vol",
      label: "24h volume",
      value: fmtUsd(volume),
      sub: "spot",
    },
    {
      key: "mcap",
      label: "Market cap",
      value: fmtUsd(overview?.marketCap),
      tone: "gold",
      sub: "circulating × price",
    },
    {
      key: "fdv",
      label: "Fully diluted",
      value: fmtUsd(overview?.fdv),
      sub: "max supply × price",
    },
    {
      key: "circ",
      label: "Circulating",
      value: overview ? (
        <span className="inline-flex items-center gap-1">
          {compactHype(overview.circulatingSupply)}
          <HypeMark size="xs" />
        </span>
      ) : (
        "—"
      ),
      sub: overview ? `${fmtPct(overview.pctCirculating)} of total` : undefined,
    },
    {
      key: "af",
      label: "Assistance Fund",
      value: fmtUsd(overview?.af?.hypeValueUsd),
      sub: overview?.af ? (
        <span className="inline-flex items-center gap-1">
          {compactHype(overview.af.hypeBalance)}
          <HypeMark size="xs" />
        </span>
      ) : undefined,
    },
    {
      key: "rev",
      label: "Lifetime revenue",
      value: fmtUsd(lifetimeRevenue),
      tone: "gold",
      sub: "fuels the buyback",
    },
  ];

  // Seven cells: 2 and 4 per row below xl with the last one spanning (one
  // column stacked seven rows at 1024), one row from xl.
  return (
    <KpiRibbon
      cells={cells}
      columns="grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 [&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1"
    />
  );
});
