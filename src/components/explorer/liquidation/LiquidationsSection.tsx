"use client";

import { Liquidation } from "@/services/explorer/liquidation";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import {
  TypedDataTable,
  ModuleAsset,
  CellValue,
  SideBadge,
  toTradeSide,
  TableStat,
  DataStatus,
  type Column,
} from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useLiquidationsContext, MIN_AMOUNT_PRESETS, type MinAmountPreset } from "./LiquidationsContext";

const MIN_AMOUNT_TABS = MIN_AMOUNT_PRESETS.map((p) => ({ value: String(p.value), label: p.label }));

export function LiquidationsSection() {
  const {
    filteredLiquidations: allLiquidations,
    isLoading,
    error,
    minAmount,
    setMinAmount,
    lastUpdated,
    refreshData,
  } = useLiquidationsContext();

  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const usd = (n: number, digits: number) =>
    `$${formatNumber(n, format, { maximumFractionDigits: digits })}`;

  const columns: Column<Liquidation>[] = [
    {
      key: "time",
      header: "Time",
      type: "time",
      accessor: (liq) => formatDateTime(liq.time, dateFormat),
    },
    {
      key: "coin",
      header: "Coin",
      accessor: (liq) => <ModuleAsset assetName={liq.coin} name={liq.coin} />,
    },
    {
      key: "side",
      header: "Side",
      accessor: (liq) => {
        const side = toTradeSide(liq.liq_dir);
        return side ? <SideBadge side={side} /> : "—";
      },
    },
    {
      key: "notional",
      header: "Notional",
      type: "numeric",
      accessor: (liq) => usd(liq.notional_total, 2),
    },
    {
      key: "size",
      header: "Size",
      type: "numeric",
      className: "max-lg:hidden",
      accessor: (liq) => formatNumber(liq.size_total, format, { maximumFractionDigits: 4 }),
    },
    {
      key: "fee",
      header: "Fee",
      type: "numeric",
      tone: () => "muted",
      className: "max-md:hidden",
      accessor: (liq) => usd(liq.fee_total_liquidated, 4),
    },
    {
      key: "method",
      header: "Method",
      className: "max-lg:hidden",
      accessor: (liq) => liq.method,
    },
    {
      // Fill VWAP vs mark: how far the forced fill printed from the mark price
      // (execution quality). Both are already in the payload, never shown.
      key: "mark",
      header: "Mark / VWAP",
      align: "right",
      className: "max-xl:hidden",
      // fill_px_vwap is nullable in the payload (some fills have no VWAP yet);
      // guard it so the cell never prints "$NaN".
      accessor: (liq) => (
        <CellValue
          value={liq.mark_px != null ? usd(liq.mark_px, 4) : "—"}
          sub={liq.fill_px_vwap != null ? `vwap ${usd(liq.fill_px_vwap, 4)}` : "vwap —"}
        />
      ),
    },
    {
      // Who executed the liquidation. `liquidators` + count are fetched but the
      // table only ever showed the liquidated user, never the liquidators.
      key: "liquidators",
      header: "Liquidators",
      className: "max-lg:hidden",
      accessor: (liq) =>
        liq.liquidators && liq.liquidators.length > 0 ? (
          <div className="inline-flex items-center gap-1.5">
            <AddressDisplay address={liq.liquidators[0]} />
            {liq.liquidator_count > 1 && (
              <StatusBadge variant="neutral">+{liq.liquidator_count - 1}</StatusBadge>
            )}
          </div>
        ) : (
          "—"
        ),
    },
    {
      key: "user",
      header: "User",
      accessor: (liq) => <AddressDisplay address={liq.liquidated_user} />,
    },
    {
      key: "hash",
      header: "Hash",
      accessor: (liq) => (
        <AddressDisplay
          address={liq.hash}
          href={`/explorer/transaction/${liq.hash}`}
          copyMessage="Hash copied to clipboard"
        />
      ),
    },
  ];

  // V4 toolbar: min-notional filter as PillTabs, freshness cue + manual
  // refresh through <DataStatus> (WS feed fills the table, REST seeds it).
  const toolbar = (
    <>
      <PillTabs
        variant="text"
        tabs={MIN_AMOUNT_TABS}
        activeTab={String(minAmount)}
        onTabChange={(v) => setMinAmount(Number(v) as MinAmountPreset)}
      />
      <TableStat label="Shown" value={allLiquidations.length} />
      <DataStatus
        variant="polled"
        className="ml-auto"
        updatedAt={lastUpdated}
        onRefresh={refreshData}
      />
    </>
  );

  return (
    <TypedDataTable<Liquidation>
      className="min-w-0"
      data={allLiquidations}
      columns={columns}
      getRowKey={(liq, idx) => `${liq.tid}-${liq.time_ms}-${idx}`}
      isLoading={isLoading}
      error={error}
      errorTitle="Failed to load liquidations"
      emptyMessage={
        minAmount > 0
          ? `No liquidations above $${(minAmount / 1000).toFixed(0)}K`
          : "No liquidations available"
      }
      paginate
      itemsPerPage={25}
      rowsPerPageOptions={[10, 25, 50, 100]}
      paginationVariant="full"
      toolbar={toolbar}
    />
  );
}
