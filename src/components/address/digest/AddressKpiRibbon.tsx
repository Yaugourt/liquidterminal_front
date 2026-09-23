"use client";

import { useMemo } from "react";
import { KpiRibbon, Skeleton, type KpiCell } from "@/components/common";
import { compactCount, compactUsd, signedCompactUsd } from "@/lib/formatters/numberFormatting";
import { formatDate, timeAgo } from "@/lib/formatters/dateFormatting";
import { useDateFormat } from "@/store/date-format.store";
import type { AddressDigestModel } from "./useAddressDigest";

interface AddressKpiRibbonProps {
  model: AddressDigestModel;
}

const tone = (v: number): KpiCell["tone"] => (v >= 0 ? "success" : "danger");
const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

/**
 * The address page's headline strip: net worth, exchange-reported PnL, the
 * indexer's edge ratios and recency — one cell each, no tables. Six cells
 * for a trading wallet so the strip tiles cleanly at 2 / 3 / 6 columns.
 * Cells whose feed has nothing for this wallet are dropped rather than shown
 * as dashes, so an on-chain-only address gets a 2-cell ribbon, not 6 blanks.
 *
 * Tracker variant: the recency cell gives way to the open exposure (what a
 * copier would be holding right now) and the win-rate cell carries the
 * recent-form delta.
 */
export function AddressKpiRibbon({ model }: AddressKpiRibbonProps) {
  const { format: dateFormat } = useDateFormat();
  const { variant, netWorth, pnl, trading, cadence, exposure, activity, isLoading, evm } = model;
  const isTracker = variant === "tracker";

  const cells = useMemo<KpiCell[]>(() => {
    const out: KpiCell[] = [];

    const dominant = [...netWorth.buckets]
      .filter((b) => b.share >= 0.1)
      .sort((a, b) => b.share - a.share)
      .slice(0, 2)
      .map((b) => `${b.label.toLowerCase()} ${Math.round(b.share * 100)}%`)
      .join(" · ");
    out.push({
      key: "networth",
      label: "Net worth",
      value: isLoading ? <Skeleton className="h-5 w-20 rounded" /> : compactUsd(netWorth.total),
      sub: isLoading
        ? " "
        : isTracker && evm.enabled && netWorth.hyperEvm > 0
          ? `core ${compactUsd(netWorth.hyperCore)} · EVM ${compactUsd(netWorth.hyperEvm)}`
          : dominant || (isTracker ? "HyperCore + HyperEVM" : "HyperCore"),
    });

    if (pnl.allTime != null) {
      const spot = pnl.perpAllTime != null ? pnl.allTime - pnl.perpAllTime : null;
      out.push({
        key: "pnl",
        label: "PnL · all-time",
        value: signedCompactUsd(pnl.allTime),
        sub:
          isTracker && spot != null && Math.abs(spot) >= 1
            ? `perp ${signedCompactUsd(pnl.perpAllTime as number)} · spot ${signedCompactUsd(spot)}`
            : "exchange-reported",
        tone: tone(pnl.allTime),
      });
    }
    if (pnl.month != null) {
      out.push({
        key: "pnl30",
        label: "30D PnL",
        value: signedCompactUsd(pnl.month),
        sub: pnl.week != null ? `7D ${signedCompactUsd(pnl.week)}` : "exchange-reported",
        tone: tone(pnl.month),
      });
    }

    if (trading) {
      const recent =
        isTracker && cadence && cadence.sample >= 20
          ? `last ${cadence.sample}: ${pct(cadence.recentWinRate)}`
          : trading.wins != null && trading.losses != null
            ? `${compactCount(trading.wins)}W / ${compactCount(trading.losses)}L`
            : `${compactCount(trading.trades)} trades`;
      out.push({
        key: "winrate",
        label: "Win rate",
        value: pct(trading.winRate),
        sub: recent,
      });
      if (trading.profitFactor != null) {
        out.push({
          key: "pf",
          label: "Profit factor",
          value: `${trading.profitFactor.toFixed(2)}x`,
          sub: "gross W / L",
          tone: trading.profitFactor >= 1 ? "success" : "danger",
        });
      }
    }

    if (isTracker) {
      if (exposure.grossNotional > 0 && exposure.longShare != null) {
        const leaning = exposure.longShare >= 0.5 ? "long" : "short";
        const share = leaning === "long" ? exposure.longShare : 1 - exposure.longShare;
        out.push({
          key: "exposure",
          label: "Open exposure",
          value: compactUsd(exposure.grossNotional),
          sub: `${Math.round(share * 100)}% ${leaning}${
            exposure.effectiveLeverage != null ? ` · ${exposure.effectiveLeverage.toFixed(1)}× eff.` : ""
          }`,
          tone: leaning === "long" ? "success" : "danger",
        });
      } else if (activity.lastSeen != null) {
        out.push({
          key: "active",
          label: "Active",
          value: `${timeAgo(activity.lastSeen)} ago`,
          sub: "no open perp position",
        });
      }
    } else if (activity.lastSeen != null) {
      out.push({
        key: "active",
        label: "Active",
        value: `${timeAgo(activity.lastSeen)} ago`,
        sub: activity.firstSeen != null ? `since ${formatDate(activity.firstSeen, dateFormat)}` : undefined,
      });
    }

    return out;
  }, [netWorth, pnl, trading, cadence, exposure, activity, isLoading, dateFormat, isTracker, evm.enabled]);

  return <KpiRibbon cells={cells} />;
}
