"use client";

import { KpiRibbon, type KpiCell, type KpiTone } from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import {
  formatExpiryCountdown,
  outcomePrice,
  questionLastTradeAt,
  type Hip4EffectiveStatus,
} from "@/lib/hip4/market-formatter";
import type { Hip4DetailLayout } from "@/lib/hip4/detail-layout";
import type {
  Hip4MarketEnrichedRow,
  Hip4QuestionOutcome,
  Hip4QuestionWithOutcomesRow,
} from "@/services/indexer/hip4";

interface Hip4DetailKpiRibbonProps {
  question: Hip4QuestionWithOutcomesRow | null;
  market: Hip4MarketEnrichedRow;
  /** Lifecycle status: a closed or settled market shows how it ended. */
  status: Hip4EffectiveStatus;
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
 * real data (e.g. 24h volume appears only once analytics resolves it). A
 * market that no longer trades shows its last trade and, when known, its
 * winner instead of live odds.
 */
export function Hip4DetailKpiRibbon({
  question,
  market,
  status,
  layout,
  activeOutcome,
  activeIndex,
  volume24h,
}: Hip4DetailKpiRibbonProps) {
  const activePrice = activeOutcome ? outcomePrice(activeOutcome) : null;
  const pct =
    activePrice != null
      ? activePrice * 100
      : market.mid_price != null && Number.isFinite(market.mid_price)
      ? market.mid_price * 100
      : null;
  // No live odds once a market stops trading: its price is its last trade.
  const lastTradePrice =
    (status === "closed" || status === "settled") && activeOutcome?.mid_price == null && activeOutcome?.final_price != null;
  const winner = question?.outcomes.find((o) => o.won === true) ?? null;
  const lastTradeAt = status === "closed" && question ? questionLastTradeAt(question) : null;

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
      label: `${headlineLabel} · ${lastTradePrice ? "Last trade" : "Implied"}`,
      value: pct != null ? `${pct.toFixed(1)}%` : "—",
      tone: headlineTone,
    },
    ...(winner
      ? [
          {
            key: "winner",
            label: "Winner",
            // Bucket and candidate names can be long: one line, full name on hover.
            value: (
              <span className="block truncate" title={winner.display_name}>
                {winner.display_name}
              </span>
            ),
            sub: question?.won_by === "settlement" ? "Settled on-chain" : "From the last trades",
          },
        ]
      : []),
    {
      key: "volume",
      label: "Total Volume",
      value: totalVolume != null ? compactUsd(totalVolume) : "—",
    },
  ];

  if (volume24h != null) {
    cells.push({ key: "vol24h", label: "24h Volume", value: compactUsd(volume24h) });
  }

  if (lastTradeAt) {
    // A closed market has no settlement date: when it last traded instead.
    cells.push({ key: "expiry", label: "Last trade", value: new Date(lastTradeAt).toLocaleDateString() });
  } else {
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
  }

  return <KpiRibbon cells={cells} />;
}
