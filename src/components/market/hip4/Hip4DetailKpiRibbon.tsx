"use client";

import { KpiRibbon, type KpiCell, type KpiTone } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { formatExpiryCountdown } from "@/lib/hip4/market-formatter";
import type { Hip4DetailLayout } from "@/lib/hip4/detail-layout";
import type {
  Hip4MarketEnrichedRow,
  Hip4QuestionOutcome,
  Hip4QuestionWithOutcomesRow,
} from "@/services/indexer/hip4";

interface Hip4DetailKpiRibbonProps {
  question: Hip4QuestionWithOutcomesRow | null;
  market: Hip4MarketEnrichedRow;
  layout: Hip4DetailLayout;
  /** The selected outcome — drives the headline implied probability. */
  activeOutcome: Hip4QuestionOutcome | null;
  /** Index of the active outcome among the question's outcomes (for Yes/No tone). */
  activeIndex: number;
  /** Cumulative 24h volume, derived from analytics (P1). Omitted when unknown. */
  volume24h?: number | null;
}

/**
 * The detail-page stat strip — implied probability of the selected outcome,
 * volume, and time-to-expiry — built on the canonical `<KpiRibbon>` (never a
 * hand-rolled strip). No fabricated metrics: cells only render where we have
 * real data (e.g. 24h volume appears only once analytics resolves it).
 */
export function Hip4DetailKpiRibbon({
  question,
  market,
  layout,
  activeOutcome,
  activeIndex,
  volume24h,
}: Hip4DetailKpiRibbonProps) {
  const pct =
    activeOutcome?.mid_price != null && Number.isFinite(activeOutcome.mid_price)
      ? activeOutcome.mid_price * 100
      : market.mid_price != null && Number.isFinite(market.mid_price)
      ? market.mid_price * 100
      : null;

  const headlineTone: KpiTone =
    layout.isYesNo && activeIndex === 0
      ? "success"
      : layout.isYesNo && activeIndex === 1
      ? "danger"
      : "default";

  const headlineLabel = activeOutcome?.display_name || "Implied";
  const totalVolume = question?.total_volume ?? market.total_volume ?? null;
  const settled = market.is_settled;
  const countdown = formatExpiryCountdown(market.expiry ?? null);

  const cells: KpiCell[] = [
    {
      key: "implied",
      label: `${headlineLabel} · Implied`,
      value: pct != null ? `${pct.toFixed(1)}%` : "—",
      tone: headlineTone,
    },
    {
      key: "volume",
      label: "Total Volume",
      value: totalVolume != null ? compactUsd(totalVolume) : "—",
    },
  ];

  if (volume24h != null) {
    cells.push({ key: "vol24h", label: "24h Volume", value: compactUsd(volume24h) });
  }

  cells.push({
    key: "expiry",
    label: settled ? "Settled" : "Expires",
    value: settled
      ? market.settled_at
        ? new Date(market.settled_at).toLocaleDateString()
        : "Resolved"
      : countdown
      ? countdown.replace(/^Expires in /, "")
      : "—",
    tone: settled ? "default" : "gold",
  });

  return <KpiRibbon cells={cells} />;
}
