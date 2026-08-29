"use client";

import { TypedDataTable, TokenAvatar, type Column } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { formatNumber, formatPrice } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useWalletRoundTrips } from "@/services/market/tracker/wallet-performance";
import type { WalletRoundTrip } from "@/services/market/tracker/wallet-performance";

interface WalletRoundTripsProps {
  address: string;
}

// Compact human duration from seconds: 29s · 12m · 3.4h · 2.1d.
function fmtDuration(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "—";
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${(s / 3600).toFixed(1)}h`;
  return `${(s / 86400).toFixed(1)}d`;
}

/**
 * Closed round-trip trades for a wallet — entry → exit, size, realized PnL and
 * hold duration, sortable to surface biggest wins or longest holds. Every row
 * is a backend-assembled entry/exit pair; the front only formats it.
 */
export function WalletRoundTrips({ address }: WalletRoundTripsProps) {
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  const { trades, isLoading, error, refetch } = useWalletRoundTrips(address, 100);

  const signedUsd = (v: number) =>
    `${v >= 0 ? "+" : "-"}$${formatNumber(Math.abs(v), format, { maximumFractionDigits: 2 })}`;

  const columns: Column<WalletRoundTrip>[] = [
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
      accessor: (t) => (
        <span className="mono text-text-secondary">
          {formatPrice(t.entry_price, format)} → {formatPrice(t.exit_price, format)}
        </span>
      ),
    },
    {
      key: "size",
      header: "Size",
      align: "right",
      className: "max-lg:hidden",
      accessor: (t) => (
        <span className="mono text-text-secondary">
          {formatNumber(t.size_close, format, { maximumFractionDigits: 4 })}
        </span>
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
      sortable: true,
      getSortValue: (t) => t.duration_s,
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

  return (
    <TypedDataTable<WalletRoundTrip>
      data={trades}
      columns={columns}
      getRowKey={(t, i) => `${t.trade_id}-${i}`}
      isLoading={isLoading}
      error={error}
      onErrorRetry={refetch}
      errorTitle="Failed to load round-trips"
      emptyMessage="No closed round-trip trades"
      emptyDescription="Completed entry→exit trades will appear here."
      paginate
      itemsPerPage={20}
      rowsPerPageOptions={[10, 20, 50]}
      paginationVariant="full"
    />
  );
}
