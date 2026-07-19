"use client";

import { useMemo } from "react";
import Link from "next/link";
import { TypedDataTable, type Column } from "@/components/common";
import { compactUsd, truncateAddress } from "@/lib/formatters/numberFormatting";
import { timeAgo } from "@/lib/formatters/dateFormatting";
import {
  buildHip3Concentration,
  isPnlPlausible,
  sanitizeHip3Traders,
} from "@/lib/hip3/traders";
import { useHip3CoinTraders, type Hip3CoinTrader } from "@/services/indexer/hip3";

function buildColumns(): Column<Hip3CoinTrader>[] {
  return [
    {
      key: "rank",
      header: "#",
      align: "right",
      width: "48px",
      accessor: (_row, _index, absoluteIndex) => (
        <span className="mono text-text-tertiary text-[11px]">{absoluteIndex + 1}</span>
      ),
    },
    {
      key: "trader",
      header: "Trader",
      align: "left",
      accessor: (row) => (
        <Link
          href={`/explorer/address/${row.trader}`}
          className="mono text-text-secondary hover:text-brand transition-colors"
        >
          {truncateAddress(row.trader)}
        </Link>
      ),
    },
    {
      key: "total_volume",
      header: "Volume",
      align: "right",
      accessor: (row) => <span className="mono">{compactUsd(row.total_volume)}</span>,
    },
    {
      key: "total_trades",
      header: "Trades",
      align: "right",
      accessor: (row) => (
        <span className="mono text-text-secondary">{row.total_trades.toLocaleString()}</span>
      ),
    },
    {
      key: "total_fees",
      header: "Fees",
      align: "right",
      accessor: (row) => <span className="mono text-gold">{compactUsd(row.total_fees)}</span>,
    },
    {
      key: "pnl_realized",
      header: "Realised PnL",
      align: "right",
      accessor: (row) => {
        // A single-fill trader reporting a PnL equal to their whole notional is
        // an artefact of the upstream aggregate, not a trade result.
        if (!isPnlPlausible(row)) {
          return <span className="text-text-tertiary">—</span>;
        }
        const positive = row.pnl_realized >= 0;
        return (
          <span className={`mono font-medium ${positive ? "text-success" : "text-danger"}`}>
            {positive ? "+" : "−"}
            {compactUsd(Math.abs(row.pnl_realized))}
          </span>
        );
      },
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
  const { traders, isLoading, error, refetch } = useHip3CoinTraders(coin);

  const clean = useMemo(() => sanitizeHip3Traders(traders), [traders]);
  const concentration = useMemo(
    () => buildHip3Concentration(clean, cumulativeVolume),
    [clean, cumulativeVolume]
  );

  const staleness = clean[0]?.last_update ? timeAgo(clean[0].last_update) : null;

  if (error) {
    return (
      <div className="bg-surface border border-border-subtle rounded-lg px-4 py-6 text-center">
        <div className="text-[13px] text-text-secondary">Trader stats unavailable</div>
        <button
          onClick={refetch}
          className="mt-2 h-7 px-2.5 text-[11px] font-medium inline-flex items-center rounded-md border border-border-default bg-surface-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <TypedDataTable<Hip3CoinTrader>
      title="Top traders on this market"
      subtitle={staleness ? `aggregate updated ${staleness}` : undefined}
      headerAction={
        concentration.share !== null ? (
          <span className="text-[11px] text-text-tertiary">
            Top 5 ·{" "}
            <span className="mono text-text-secondary">
              {(concentration.share * 100).toFixed(1)}%
            </span>{" "}
            of {compactUsd(concentration.reference ?? 0)}
          </span>
        ) : undefined
      }
      data={clean}
      columns={buildColumns()}
      getRowKey={(row) => row.trader}
      isLoading={isLoading}
      density="compact"
      paginate
      paginationVariant="compact"
      itemsPerPage={10}
      emptyMessage="No trader stats yet"
      emptyDescription="This market has not been aggregated"
    />
  );
}
