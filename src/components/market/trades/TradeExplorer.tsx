"use client";

import { useMemo, useState, useEffect } from "react";
import {
  TypedDataTable,
  ModuleAsset,
  SideBadge,
  toTradeSide,
  KpiRibbon,
  SourceBadge,
  combinedSourceStatus,
  type Column,
  type KpiCell,
} from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { Input } from "@/components/ui/input";
import { PillTabs } from "@/components/ui/pill-tabs";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { compactUsd, compactCount, formatPrice, signedCompactUsd } from "@/lib/formatters/numberFormatting";
import { formatDateTime, formatDuration } from "@/lib/formatters/dateFormatting";
import type { WalletRoundTrip } from "@/services/market/tracker/wallet-performance";
import {
  useTradeExplorer,
  useTradeSummary,
  type TradeSortBy,
  type TradeSortDir,
} from "@/services/market/trade-explorer";

type SortKey = "top_pnl" | "worst_pnl" | "volume" | "duration";

const SORT_TABS: { value: SortKey; label: string }[] = [
  { value: "top_pnl", label: "Top wins" },
  { value: "worst_pnl", label: "Biggest losses" },
  { value: "volume", label: "Top volume" },
  { value: "duration", label: "Longest held" },
];

const SORT_MAP: Record<SortKey, { sortBy: TradeSortBy; sortDir: TradeSortDir }> = {
  top_pnl: { sortBy: "pnl_realized", sortDir: "DESC" },
  worst_pnl: { sortBy: "pnl_realized", sortDir: "ASC" },
  volume: { sortBy: "total_volume", sortDir: "DESC" },
  duration: { sortBy: "duration_s", sortDir: "DESC" },
};

/**
 * Market-wide trade explorer: every closed round-trip on Hyperliquid, filterable
 * by coin and sortable by realized PnL, volume or hold time. Backend-assembled
 * entry/exit pairs; the front only filters and formats.
 */
export function TradeExplorer() {
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const [sort, setSort] = useState<SortKey>("top_pnl");
  const [coinInput, setCoinInput] = useState("");
  const [coin, setCoin] = useState("");

  // Debounce the coin filter so typing does not fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setCoin(coinInput.trim()), 400);
    return () => clearTimeout(id);
  }, [coinInput]);

  const { sortBy, sortDir } = SORT_MAP[sort];
  const explorer = useTradeExplorer({ coin, sortBy, sortDir, limit: 100 });
  const summaryFeed = useTradeSummary();
  const { trades, isLoading, error, refetch } = explorer;
  const { summary } = summaryFeed;

  const cells: KpiCell[] = useMemo(() => {
    if (!summary) return [];
    const longs = summary.direction_breakdown.find((d) => d.direction === "long");
    const shorts = summary.direction_breakdown.find((d) => d.direction === "short");
    const total = (longs?.count ?? 0) + (shorts?.count ?? 0);
    const pct = (n?: number) => (total > 0 ? `${(((n ?? 0) / total) * 100).toFixed(0)}%` : "—");
    return [
      { key: "trades", label: "Closed trades", value: compactCount(summary.total_trades), sub: "all-time" },
      { key: "vol", label: "Volume", value: compactUsd(summary.total_volume) },
      { key: "long", label: "Longs", value: compactCount(longs?.count ?? 0), sub: pct(longs?.count), tone: "success" },
      { key: "short", label: "Shorts", value: compactCount(shorts?.count ?? 0), sub: pct(shorts?.count), tone: "danger" },
    ];
  }, [summary]);

  const columns: Column<WalletRoundTrip>[] = [
    {
      key: "user",
      header: "Trader",
      accessor: (t) =>
        t.user ? <AddressDisplay address={t.user} href={`/market/tracker/wallet/${t.user}`} /> : "—",
    },
    {
      key: "coin",
      header: "Coin",
      accessor: (t) => <ModuleAsset assetName={t.coin} name={t.coin} />,
    },
    {
      key: "direction",
      header: "Side",
      accessor: (t) => {
        const side = toTradeSide(t.direction);
        return side ? <SideBadge side={side} /> : "—";
      },
    },
    {
      key: "entryexit",
      header: "Entry → Exit",
      type: "numeric",
      tone: () => "muted",
      className: "max-lg:hidden",
      accessor: (t) => `${formatPrice(t.entry_price, format)} → ${formatPrice(t.exit_price, format)}`,
    },
    {
      key: "volume",
      header: "Volume",
      type: "numeric",
      sortable: true,
      getSortValue: (t) => t.total_volume,
      accessor: (t) => compactUsd(t.total_volume),
    },
    {
      key: "pnl",
      header: "Realized PnL",
      type: "change",
      sortable: true,
      getSortValue: (t) => t.pnl_realized,
      accessor: (t) => signedCompactUsd(t.pnl_realized),
    },
    {
      key: "duration",
      header: "Held",
      type: "numeric",
      tone: () => "muted",
      className: "max-md:hidden",
      accessor: (t) => formatDuration(t.duration_s),
    },
    {
      key: "closed",
      header: "Closed",
      type: "time",
      align: "right",
      className: "max-md:hidden",
      accessor: (t) => formatDateTime(t.end_time, dateFormat),
    },
  ];

  const toolbar = (
    <>
      <Input
        value={coinInput}
        onChange={(e) => setCoinInput(e.target.value)}
        placeholder="Filter coin (e.g. BTC)"
        className="h-8 w-40 text-xs"
      />
      <PillTabs
        tabs={SORT_TABS}
        activeTab={sort}
        onTabChange={(v) => setSort(v as SortKey)}
        variant="text"
      />
    </>
  );

  return (
    <div className="space-y-4">
      <KpiRibbon cells={cells} />
      <TypedDataTable<WalletRoundTrip>
        title="Trade explorer"
        subtitle="Every closed round-trip on Hyperliquid, filter by coin and sort"
        headerAction={<SourceBadge source="hypedexer" status={combinedSourceStatus(explorer, summaryFeed)} />}
        toolbar={toolbar}
        data={trades}
        columns={columns}
        getRowKey={(t, i) => `${t.trade_id}-${i}`}
        isLoading={isLoading}
        error={error}
        onErrorRetry={refetch}
        errorTitle="Failed to load trades"
        emptyMessage="No trades"
        emptyDescription="Closed round-trip trades will appear here."
      />
    </div>
  );
}
