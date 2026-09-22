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

/**
 * The address page's headline strip: net worth, exchange-reported PnL, the
 * indexer's edge ratios and recency — one cell each, no tables. Six cells
 * for a trading wallet so the strip tiles cleanly at 2 / 3 / 6 columns.
 * Cells whose feed has nothing for this wallet are dropped rather than shown
 * as dashes, so an on-chain-only address gets a 2-cell ribbon, not 6 blanks.
 */
export function AddressKpiRibbon({ model }: AddressKpiRibbonProps) {
  const { format: dateFormat } = useDateFormat();
  const { netWorth, pnl, trading, activity, isLoading } = model;

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
      sub: isLoading ? " " : dominant || "HyperCore",
    });

    if (pnl.allTime != null) {
      out.push({
        key: "pnl",
        label: "PnL · all-time",
        value: signedCompactUsd(pnl.allTime),
        sub: "exchange-reported",
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
      out.push({
        key: "winrate",
        label: "Win rate",
        value: `${(trading.winRate * 100).toFixed(1)}%`,
        sub:
          trading.wins != null && trading.losses != null
            ? `${compactCount(trading.wins)}W / ${compactCount(trading.losses)}L`
            : `${compactCount(trading.trades)} trades`,
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

    if (activity.lastSeen != null) {
      out.push({
        key: "active",
        label: "Active",
        value: `${timeAgo(activity.lastSeen)} ago`,
        sub: activity.firstSeen != null ? `since ${formatDate(activity.firstSeen, dateFormat)}` : undefined,
      });
    }

    return out;
  }, [netWorth, pnl, trading, activity, isLoading, dateFormat]);

  return <KpiRibbon cells={cells} />;
}
