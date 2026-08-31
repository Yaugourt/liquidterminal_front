"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Receipt } from "lucide-react";
import {
  TypedDataTable,
  TokenAvatar,
  KpiRibbon,
  type Column,
  type KpiCell,
} from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { PillTabs } from "@/components/ui/pill-tabs";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { compactUsd, compactCount, formatNumber, formatPrice } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
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

/** Compact human duration from seconds: 29s · 12m · 3.4h · 2.1d. */
function fmtDuration(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "—";
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${(s / 3600).toFixed(1)}h`;
  return `${(s / 86400).toFixed(1)}d`;
}

function shortAddr(a: string): string {
  return a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "—";
}

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
  const { trades, isLoading, error, refetch } = useTradeExplorer({ coin, sortBy, sortDir, limit: 100 });
  const { summary } = useTradeSummary();

  const signedUsd = (v: number) =>
    `${v >= 0 ? "+" : "-"}$${formatNumber(Math.abs(v), format, { maximumFractionDigits: 2 })}`;

  const cells: KpiCell[] = useMemo(() => {
    if (!summary) return [];
    const longs = summary.direction_breakdown.find((d) => d.direction === "long");
    const shorts = summary.direction_breakdown.find((d) => d.direction === "short");
    const total = (longs?.count ?? 0) + (shorts?.count ?? 0);
    const pct = (n?: number) => (total > 0 ? `${(((n ?? 0) / total) * 100).toFixed(0)}%` : "—");
    return [
      { key: "trades", label: "Closed trades", value: compactCount(summary.total_trades), sub: "all-time" },
      { key: "vol", label: "Volume", value: `$${compactUsd(summary.total_volume).replace(/^\$/, "")}` },
      { key: "long", label: "Longs", value: compactCount(longs?.count ?? 0), sub: pct(longs?.count), tone: "success" },
      { key: "short", label: "Shorts", value: compactCount(shorts?.count ?? 0), sub: pct(shorts?.count), tone: "danger" },
    ];
  }, [summary]);

  const columns: Column<WalletRoundTrip>[] = [
    {
      key: "user",
      header: "Trader",
      accessor: (t) => (
        <Link
          href={`/market/tracker/wallet/${t.user}`}
          className="mono text-brand hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {shortAddr(t.user)}
        </Link>
      ),
    },
    {
      key: "coin",
      header: "Coin",
      accessor: (t) => (
        <span className="inline-flex items-center gap-2">
          <TokenAvatar assetName={t.coin} size="sm" kind="auto" />
          <span className="text-text-primary font-medium">{t.coin}</span>
        </span>
      ),
    },
    {
      key: "direction",
      header: "Side",
      accessor: (t) => (
        <StatusBadge variant={t.direction?.toLowerCase() === "long" ? "success" : "error"}>
          {t.direction?.toLowerCase() === "long" ? "Long" : "Short"}
        </StatusBadge>
      ),
    },
    {
      key: "entryexit",
      header: "Entry → Exit",
      align: "right",
      className: "max-lg:hidden",
      accessor: (t) => (
        <span className="mono text-text-secondary">
          {formatPrice(t.entry_price, format)} → {formatPrice(t.exit_price, format)}
        </span>
      ),
    },
    {
      key: "volume",
      header: "Volume",
      align: "right",
      sortable: true,
      getSortValue: (t) => t.total_volume,
      accessor: (t) => (
        <span className="mono text-text-secondary">${compactUsd(t.total_volume).replace(/^\$/, "")}</span>
      ),
    },
    {
      key: "pnl",
      header: "Realized PnL",
      align: "right",
      sortable: true,
      getSortValue: (t) => t.pnl_realized,
      accessor: (t) => (
        <span className={`mono font-medium ${t.pnl_realized >= 0 ? "text-success" : "text-danger"}`}>
          {signedUsd(t.pnl_realized)}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Held",
      align: "right",
      className: "max-md:hidden",
      accessor: (t) => <span className="mono text-text-tertiary">{fmtDuration(t.duration_s)}</span>,
    },
    {
      key: "closed",
      header: "Closed",
      align: "right",
      className: "max-md:hidden",
      accessor: (t) => (
        <span className="text-text-tertiary text-xs">{formatDateTime(t.end_time, dateFormat)}</span>
      ),
    },
  ];

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <input
        value={coinInput}
        onChange={(e) => setCoinInput(e.target.value)}
        placeholder="Filter coin (e.g. BTC)"
        className="h-8 w-40 rounded-md border border-border-subtle bg-surface-2 px-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus:border-brand focus:outline-none"
      />
      <PillTabs
        tabs={SORT_TABS}
        activeTab={sort}
        onTabChange={(v) => setSort(v as SortKey)}
        variant="text"
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <KpiRibbon cells={cells} />
      <TypedDataTable<WalletRoundTrip>
        title="Trade explorer"
        icon={<Receipt size={15} className="text-brand" />}
        subtitle="Every closed round-trip on Hyperliquid, filter by coin and sort"
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
