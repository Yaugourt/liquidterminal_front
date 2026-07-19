"use client";

import { useState } from "react";
import Link from "next/link";
import { TypedDataTable, type Column } from "@/components/common";
import { compactUsd, formatPrice, truncateAddress } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import { useHip3CoinFills, type Hip3Fill } from "@/services/indexer/hip3";

const THRESHOLDS = [
  { label: "$10K", value: 10_000 },
  { label: "$25K", value: 25_000 },
  { label: "$100K", value: 100_000 },
];

function buildColumns(format: NumberFormatType): Column<Hip3Fill>[] {
  return [
    {
      key: "time",
      header: "Time",
      align: "left",
      accessor: (fill) => (
        <span className="mono text-text-tertiary">{fill.time.slice(11, 19)}</span>
      ),
    },
    {
      key: "side",
      header: "Side",
      align: "left",
      width: "88px",
      accessor: (fill) => (
        <span className="inline-flex items-center gap-1.5">
          <span className={`font-medium ${fill.side === "B" ? "text-success" : "text-danger"}`}>
            {fill.side === "B" ? "BUY" : "SELL"}
          </span>
          {fill.is_liquidation === 1 && (
            <span className="text-[10px] px-1 py-0.5 rounded bg-danger/10 border border-danger/25 text-danger font-medium">
              LIQ
            </span>
          )}
        </span>
      ),
    },
    {
      key: "px",
      header: "Price",
      align: "right",
      accessor: (fill) => <span className="mono">{formatPrice(fill.px, format)}</span>,
    },
    {
      key: "sz",
      header: "Size",
      align: "right",
      accessor: (fill) => (
        <span className="mono text-text-secondary">
          {fill.sz.toLocaleString(undefined, { maximumFractionDigits: 4 })}
        </span>
      ),
    },
    {
      key: "notional",
      header: "Notional",
      align: "right",
      accessor: (fill) => <span className="mono">{compactUsd(fill.notional)}</span>,
    },
    {
      key: "fee",
      header: "Fee",
      align: "right",
      // Raw floats arrive with binary artefacts (2.6014340000000002). Sub-dollar
      // fees still need real precision, so scale the decimals to the magnitude.
      accessor: (fill) => (
        <span className="mono text-gold">
          ${fill.fee < 1 ? fill.fee.toFixed(4) : fill.fee.toFixed(2)}
        </span>
      ),
    },
    {
      key: "user",
      header: "Trader",
      align: "left",
      accessor: (fill) => (
        <Link
          href={`/explorer/address/${fill.user}`}
          className="mono text-text-secondary hover:text-brand transition-colors"
        >
          {truncateAddress(fill.user)}
        </Link>
      ),
    },
  ];
}

/**
 * Large fills on this market.
 *
 * Not a duplicate of the order book's Trades tab: the Hyperliquid WS feed
 * carries neither the taker address, nor a liquidation flag, nor the fee. This
 * one does, and — the actual reason it earns its place — it filters by notional
 * *server-side*, so a $25K floor reaches back days instead of being limited to
 * whatever a 50-row WS buffer happens to hold.
 */
export function Hip3MarketTape({ coin }: { coin: string }) {
  const { format } = useNumberFormat();
  const [threshold, setThreshold] = useState(THRESHOLDS[1].value);
  const [liquidationsOnly, setLiquidationsOnly] = useState(false);

  const { fills, isLoading, error, refetch } = useHip3CoinFills({
    coin,
    minNotional: threshold,
    liquidationsOnly,
  });

  // The proxy answers 402 when the HypeDexer subscription lapses. The page core
  // is Hyperliquid-only, so this card fails on its own without taking anything
  // else down — but it must offer a retry, since polling stops on a 4xx.
  if (error) {
    return (
      <div className="bg-surface border border-border-subtle rounded-lg px-4 py-6 text-center">
        <div className="text-[13px] text-text-secondary">Large fills unavailable</div>
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
    <TypedDataTable<Hip3Fill>
      title="Large fills"
      subtitle={`≥ ${compactUsd(threshold)} notional`}
      headerAction={
        <div className="flex items-center gap-3 text-xs">
          {THRESHOLDS.map((option) => (
            <button
              key={option.value}
              onClick={() => setThreshold(option.value)}
              className={
                threshold === option.value
                  ? "text-brand font-medium"
                  : "text-text-tertiary hover:text-text-primary transition-colors"
              }
            >
              {option.label}
            </button>
          ))}
          <button
            onClick={() => setLiquidationsOnly((previous) => !previous)}
            className={
              liquidationsOnly
                ? "text-brand font-medium"
                : "text-text-tertiary hover:text-text-primary transition-colors"
            }
          >
            Liquidations
          </button>
        </div>
      }
      data={fills}
      columns={buildColumns(format)}
      getRowKey={(fill) => `${fill.tid}-${fill.user}-${fill.time}`}
      isLoading={isLoading}
      density="compact"
      // A server-side notional floor reaches back days, so the result set is
      // long by design. Paginate rather than let it stretch the page.
      paginate
      paginationVariant="compact"
      itemsPerPage={10}
      emptyMessage={liquidationsOnly ? "No liquidations in range" : "No fills above this size"}
      emptyDescription={
        liquidationsOnly ? "Liquidations are rare on HIP-3 markets" : "Try a lower threshold"
      }
    />
  );
}
