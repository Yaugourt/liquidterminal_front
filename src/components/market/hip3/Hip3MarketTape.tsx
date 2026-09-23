"use client";

import { useState } from "react";
import {
  TypedDataTable,
  SideBadge,
  toTradeSide,
  SourceBadge,
  sourceStatus,
  type Column,
} from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { StatusBadge } from "@/components/ui/status-badge";
import { PillTabs } from "@/components/ui/pill-tabs";
import { compactUsd, formatNumber, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";
import { useHip3CoinFills, type Hip3Fill } from "@/services/indexer/hip3";

const THRESHOLDS = [
  { label: "$10K", value: "10000" },
  { label: "$25K", value: "25000" },
  { label: "$100K", value: "100000" },
];

const FILL_KINDS = [
  { label: "All fills", value: "all" },
  { label: "Liquidations", value: "liq" },
];

function buildColumns(format: NumberFormatType): Column<Hip3Fill>[] {
  return [
    {
      key: "time",
      header: "Time",
      type: "time",
      accessor: (fill) => fill.time.slice(11, 19),
    },
    {
      key: "side",
      header: "Side",
      width: "120px",
      accessor: (fill) => {
        const side = toTradeSide(fill.side);
        return (
          <span className="inline-flex items-center gap-1.5">
            {side ? <SideBadge side={side} /> : "—"}
            {fill.is_liquidation === 1 && <StatusBadge variant="error">LIQ</StatusBadge>}
          </span>
        );
      },
    },
    {
      key: "px",
      header: "Price",
      type: "numeric",
      accessor: (fill) => formatPrice(fill.px, format),
    },
    {
      key: "sz",
      header: "Size",
      type: "numeric",
      tone: () => "muted",
      accessor: (fill) => formatNumber(fill.sz, format, { maximumFractionDigits: 4 }),
    },
    {
      key: "notional",
      header: "Notional",
      type: "numeric",
      accessor: (fill) => compactUsd(fill.notional),
    },
    {
      key: "fee",
      header: "Fee",
      type: "fees",
      // Raw floats arrive with binary artefacts (2.6014340000000002). Sub-dollar
      // fees still need real precision, so scale the decimals to the magnitude.
      accessor: (fill) => compactUsd(fill.fee, fill.fee < 1 ? { decimals: 4 } : undefined),
    },
    {
      key: "user",
      header: "Trader",
      accessor: (fill) => <AddressDisplay address={fill.user} showCopy={false} />,
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
  const [threshold, setThreshold] = useState(Number(THRESHOLDS[1].value));
  const [liquidationsOnly, setLiquidationsOnly] = useState(false);

  const { fills, isLoading, error, refetch } = useHip3CoinFills({
    coin,
    minNotional: threshold,
    liquidationsOnly,
  });

  // The proxy answers 402 when the HypeDexer subscription lapses. The page core
  // is Hyperliquid-only, so this card fails on its own without taking anything
  // else down — but it must offer a retry, since polling stops on a 4xx.
  return (
    <TypedDataTable<Hip3Fill>
      title="Large fills"
      subtitle={`≥ ${compactUsd(threshold)} notional`}
      headerAction={<SourceBadge source="hypedexer" status={sourceStatus(error, isLoading)} />}
      toolbar={
        <>
          <PillTabs
            variant="text"
            tabs={THRESHOLDS}
            activeTab={String(threshold)}
            onTabChange={(value) => setThreshold(Number(value))}
          />
          <PillTabs
            variant="text"
            className="ml-auto"
            tabs={FILL_KINDS}
            activeTab={liquidationsOnly ? "liq" : "all"}
            onTabChange={(value) => setLiquidationsOnly(value === "liq")}
          />
        </>
      }
      data={fills}
      columns={buildColumns(format)}
      getRowKey={(fill) => `${fill.tid}-${fill.user}-${fill.time}`}
      isLoading={isLoading}
      error={error}
      onErrorRetry={refetch}
      errorTitle="Large fills unavailable"
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
