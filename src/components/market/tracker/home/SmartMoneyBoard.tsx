"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import {
  TypedDataTable,
  type Column,
  KpiRibbon,
  type KpiCell,
} from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { useTopTraders, type TopTrader } from "@/services/market/toptraders";

/** The four server-side rankings the leaderboard endpoint exposes. */
type Metric = "pnl_pos" | "pnl_neg" | "volume" | "trades";

const METRIC_TABS: { value: Metric; label: string }[] = [
  { value: "pnl_pos", label: "Top winners" },
  { value: "pnl_neg", label: "Top losers" },
  { value: "volume", label: "Whales" },
  { value: "trades", label: "Most active" },
];

const SUBTITLE: Record<Metric, string> = {
  pnl_pos: "Top 50 by realized PnL · 24h",
  pnl_neg: "Biggest realized losses · 24h",
  volume: "Top 50 by traded volume · 24h",
  trades: "Top 50 by trade count · 24h",
};

const LIMIT = 50;

const signedUsd = (v: number) => `${v >= 0 ? "+" : "-"}$${compactUsd(Math.abs(v)).replace(/^\$/, "")}`;

/**
 * Smart Money — the market's top traders ranked server-side by realized PnL,
 * losses, volume or activity over 24h. Unlike a single-fetch preview that can
 * only client-sort the top winners, each tab pulls the TRUE top-50 for that
 * metric (the volume whales and biggest losers are otherwise invisible), and
 * the ribbon aggregates the cohort shown. Avg trade size = volume / trades.
 */
export function SmartMoneyBoard() {
  const [metric, setMetric] = useState<Metric>("pnl_pos");
  const { traders, isLoading, error, refetch } = useTopTraders({
    sort: metric,
    limit: LIMIT,
  });

  const ribbon: KpiCell[] = useMemo(() => {
    const n = traders.length;
    const netPnl = traders.reduce((s, t) => s + t.totalPnl, 0);
    const vol = traders.reduce((s, t) => s + t.totalVolume, 0);
    const avgWin = n ? traders.reduce((s, t) => s + t.winRate, 0) / n : 0;
    return [
      {
        key: "pnl",
        label: `Net PnL · top ${n || LIMIT}`,
        value: signedUsd(netPnl),
        tone: netPnl >= 0 ? "success" : "danger",
      },
      { key: "vol", label: "Combined volume", value: `$${compactUsd(vol).replace(/^\$/, "")}` },
      { key: "win", label: "Avg win rate", value: `${(avgWin * 100).toFixed(1)}%` },
      { key: "n", label: "Traders shown", value: compactCount(n) },
    ];
  }, [traders]);

  const columns: Column<TopTrader>[] = [
    {
      key: "rank",
      header: "#",
      accessor: (_t, _i, absoluteIndex) => (
        <span className="text-gold font-semibold">#{absoluteIndex + 1}</span>
      ),
    },
    {
      key: "trader",
      header: "Trader",
      accessor: (t) => (
        <Link
          href={`/market/tracker/wallet/${t.user}`}
          className="mono text-sm text-brand hover:underline"
        >
          {t.user.slice(0, 6)}...{t.user.slice(-4)}
        </Link>
      ),
    },
    {
      key: "totalPnl",
      header: "PnL (24h)",
      sortable: true,
      align: "right",
      getSortValue: (t) => t.totalPnl,
      accessor: (t) => (
        <span className={`mono ${t.totalPnl >= 0 ? "text-success" : "text-danger"}`}>
          {signedUsd(t.totalPnl)}
        </span>
      ),
    },
    {
      key: "totalVolume",
      header: "Volume",
      sortable: true,
      align: "right",
      getSortValue: (t) => t.totalVolume,
      type: "numeric",
      accessor: (t) => `$${compactUsd(t.totalVolume).replace(/^\$/, "")}`,
    },
    {
      key: "avgSize",
      header: "Avg size",
      sortable: true,
      align: "right",
      getSortValue: (t) => (t.tradeCount > 0 ? t.totalVolume / t.tradeCount : 0),
      type: "numeric",
      accessor: (t) =>
        t.tradeCount > 0
          ? `$${compactUsd(t.totalVolume / t.tradeCount).replace(/^\$/, "")}`
          : "—",
    },
    {
      key: "winRate",
      header: "Win rate",
      sortable: true,
      align: "right",
      getSortValue: (t) => t.winRate,
      accessor: (t) => (
        <span className={`mono ${t.winRate >= 0.5 ? "text-success" : "text-text-secondary"}`}>
          {(t.winRate * 100).toFixed(1)}%
        </span>
      ),
    },
    {
      key: "tradeCount",
      header: "Trades",
      sortable: true,
      align: "right",
      getSortValue: (t) => t.tradeCount,
      type: "numeric",
      accessor: (t) => compactCount(t.tradeCount),
    },
  ];

  return (
    <div className="space-y-4">
      <KpiRibbon cells={ribbon} />
      <TypedDataTable<TopTrader>
        title="Smart Money"
        icon={<Crown className="h-5 w-5 text-brand" />}
        subtitle={SUBTITLE[metric]}
        toolbar={
          <PillTabs
            tabs={METRIC_TABS}
            activeTab={metric}
            onTabChange={(v) => setMetric(v as Metric)}
          />
        }
        data={traders}
        columns={columns}
        getRowKey={(t) => t.user}
        isLoading={isLoading}
        error={error}
        onErrorRetry={refetch}
        errorTitle="Failed to load smart money"
        emptyMessage="No traders for this ranking"
        paginate
        itemsPerPage={10}
      />
    </div>
  );
}
