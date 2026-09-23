"use client";

import { useMemo } from "react";
import { TypedDataTable, SourceBadge, sourceStatus, type Column } from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { compactUsd, formatNumber, signedCompactUsd } from "@/lib/formatters/numberFormatting";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import {
  buildHip3Concentration,
  isPnlPlausible,
  sanitizeHip3Traders,
} from "@/lib/hip3/traders";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import { useHip3CoinTraders, type Hip3CoinTrader } from "@/services/indexer/hip3";

function buildColumns(format: NumberFormatType): Column<Hip3CoinTrader>[] {
  return [
    {
      key: "rank",
      header: "#",
      type: "rank",
      width: "48px",
      accessor: (_row, _index, absoluteIndex) => absoluteIndex + 1,
    },
    {
      key: "trader",
      header: "Trader",
      accessor: (row) => <AddressDisplay address={row.trader} />,
    },
    {
      key: "total_volume",
      header: "Volume",
      type: "numeric",
      accessor: (row) => compactUsd(row.total_volume),
    },
    {
      key: "total_trades",
      header: "Trades",
      type: "numeric",
      tone: () => "muted",
      accessor: (row) => formatNumber(row.total_trades, format, { maximumFractionDigits: 0 }),
    },
    {
      key: "total_fees",
      header: "Fees",
      type: "fees",
      accessor: (row) => compactUsd(row.total_fees),
    },
    {
      key: "pnl_realized",
      header: "Realised PnL",
      type: "change",
      // A single-fill trader reporting a PnL equal to their whole notional is
      // an artefact of the upstream aggregate, not a trade result.
      getSortValue: (row) => (isPnlPlausible(row) ? row.pnl_realized : 0),
      tone: (row) => (isPnlPlausible(row) ? undefined : "muted"),
      accessor: (row) => (isPnlPlausible(row) ? signedCompactUsd(row.pnl_realized) : "—"),
    },
  ];
}

/**
 * Who actually trades this market, and how they have done.
 *
 * This is the one module no other Hyperliquid front carries: realised PnL per
 * trader, per HIP-3 asset. It is also the most fragile thing on the page — the
 * aggregate can lag by weeks on quiet markets, so its age is always displayed.
 */
export function Hip3TopTraders({
  coin,
  cumulativeVolume,
}: {
  coin: string;
  /** Cumulative market volume, the only honest denominator for concentration. */
  cumulativeVolume: number | null;
}) {
  const { format } = useNumberFormat();
  const { traders, isLoading, error, refetch } = useHip3CoinTraders(coin);

  const clean = useMemo(() => sanitizeHip3Traders(traders), [traders]);
  const concentration = useMemo(
    () => buildHip3Concentration(clean, cumulativeVolume),
    [clean, cumulativeVolume]
  );

  const staleness = clean[0]?.last_update ? timeAgo(clean[0].last_update) : null;

  return (
    <TypedDataTable<Hip3CoinTrader>
      title="Top traders on this market"
      subtitle={staleness ? `aggregate updated ${staleness}` : undefined}
      tag={
        concentration.share !== null
          ? `Top 5 · ${(concentration.share * 100).toFixed(1)}% of ${compactUsd(concentration.reference ?? 0)}`
          : undefined
      }
      headerAction={<SourceBadge source="hypedexer" status={sourceStatus(error, isLoading)} />}
      data={clean}
      columns={buildColumns(format)}
      getRowKey={(row) => row.trader}
      isLoading={isLoading}
      error={error}
      onErrorRetry={refetch}
      errorTitle="Trader stats unavailable"
      density="compact"
      paginate
      paginationVariant="compact"
      itemsPerPage={10}
      emptyMessage="No trader stats yet"
      emptyDescription="This market has not been aggregated"
    />
  );
}
