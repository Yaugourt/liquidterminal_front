"use client";

import {
  TypedDataTable,
  ModuleAsset,
  SideBadge,
  toTradeSide,
  SourceBadge,
  sourceStatus,
  type Column,
} from "@/components/common";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { formatNumber, formatPrice, signedCompactUsd } from "@/lib/formatters/numberFormatting";
import { formatDateTime, formatDuration } from "@/lib/formatters/dateFormatting";
import { useWalletRoundTrips } from "@/services/market/tracker/wallet-performance";
import type { WalletRoundTrip } from "@/services/market/tracker/wallet-performance";

/** Cap on the round-trips fetched per wallet. */
const ROUND_TRIPS_LIMIT = 100;

interface WalletRoundTripsProps {
  address: string;
}

/**
 * Closed round-trip trades for a wallet — entry → exit, size, realized PnL and
 * hold duration, sortable to surface biggest wins or longest holds. Every row
 * is a backend-assembled entry/exit pair; the front only formats it.
 */
export function WalletRoundTrips({ address }: WalletRoundTripsProps) {
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();
  const { trades, isLoading, error, refetch } = useWalletRoundTrips(address, ROUND_TRIPS_LIMIT);

  const columns: Column<WalletRoundTrip>[] = [
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
      accessor: (t) => `${formatPrice(t.entry_price, format)} → ${formatPrice(t.exit_price, format)}`,
    },
    {
      key: "size",
      header: "Size",
      type: "numeric",
      className: "max-lg:hidden",
      accessor: (t) => formatNumber(t.size_close, format, { maximumFractionDigits: 4 }),
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
      sortable: true,
      getSortValue: (t) => t.duration_s,
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

  return (
    <TypedDataTable<WalletRoundTrip>
      title="Round-trip trades"
      // The fetch is capped: at the cap, say "last N", not a lifetime total.
      tag={trades.length > 0 ? `${trades.length >= ROUND_TRIPS_LIMIT ? "last " : ""}${trades.length} trades` : undefined}
      headerAction={<SourceBadge source="hypedexer" status={sourceStatus(error, isLoading)} />}
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
      density="compact"
    />
  );
}
