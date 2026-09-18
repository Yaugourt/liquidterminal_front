"use client";

import { Liquidation } from "@/services/explorer/liquidation";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { TypedDataTable, TokenAvatar, DataStatus, type Column } from "@/components/common";
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

  const columns: Column<Liquidation>[] = [
    {
      key: "time",
      header: "Time",
      accessor: (liq) => (
        <span className="text-text-secondary text-sm">
          {formatDateTime(liq.time, dateFormat)}
        </span>
      ),
    },
    {
      key: "coin",
      header: "Coin",
      accessor: (liq) => (
        <span className="inline-flex items-center gap-2">
          <TokenAvatar assetName={liq.coin} size="md" />
          <span className="text-brand font-medium">{liq.coin}</span>
        </span>
      ),
    },
    {
      key: "side",
      header: "Side",
      accessor: (liq) => (
        <StatusBadge variant={liq.liq_dir === "Long" ? "success" : "error"}>
          {liq.liq_dir}
        </StatusBadge>
      ),
    },
    {
      key: "notional",
      header: "Notional",
      type: "numeric",
      accessor: (liq) => (
        <span className="font-medium">
          ${formatNumber(liq.notional_total, format, { maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: "size",
      header: "Size",
      type: "numeric",
      className: "max-lg:hidden",
      accessor: (liq) => (
        <span className="font-medium">
          {formatNumber(liq.size_total, format, { maximumFractionDigits: 4 })}
        </span>
      ),
    },
    {
      key: "fee",
      header: "Fee",
      type: "numeric",
      className: "max-md:hidden",
      accessor: (liq) => (
        <span className="text-text-tertiary">
          ${formatNumber(liq.fee_total_liquidated, format, { maximumFractionDigits: 4 })}
        </span>
      ),
    },
    {
      key: "method",
      header: "Method",
      className: "max-lg:hidden",
      accessor: (liq) => (
        <span className="text-text-secondary">{liq.method}</span>
      ),
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
        <div className="flex flex-col items-end leading-tight">
          <span className="mono text-text-primary">
            {liq.mark_px != null
              ? `$${formatNumber(liq.mark_px, format, { maximumFractionDigits: 4 })}`
              : "—"}
          </span>
          <span className="mono text-[10px] text-text-tertiary">
            {liq.fill_px_vwap != null
              ? `vwap $${formatNumber(liq.fill_px_vwap, format, { maximumFractionDigits: 4 })}`
              : "vwap —"}
          </span>
        </div>
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
          <span className="inline-flex items-center gap-1.5">
            {liq.liquidator_count > 1 && (
              <span className="mono text-[10px] text-text-tertiary px-1 rounded bg-surface-2 border border-border-subtle">
                {liq.liquidator_count}
              </span>
            )}
            <AddressDisplay address={liq.liquidators[0]} />
          </span>
        ) : (
          <span className="text-text-tertiary">—</span>
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
        <AddressDisplay address={liq.hash} showExternalLink showCopy />
      ),
    },
  ];

  // V4 toolbar: min-notional filter as PillTabs, freshness cue + manual
  // refresh through <DataStatus> (WS feed fills the table, REST seeds it).
  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <PillTabs
        tabs={MIN_AMOUNT_TABS}
        activeTab={String(minAmount)}
        onTabChange={(v) => setMinAmount(Number(v) as MinAmountPreset)}
      />
      <span className="text-text-tertiary text-xs shrink-0">
        {allLiquidations.length} shown
      </span>
      <DataStatus
        variant="polled"
        className="ml-auto"
        updatedAt={lastUpdated}
        onRefresh={refreshData}
      />
    </div>
  );

  return (
    <div className="min-w-0 bg-surface border border-border-subtle rounded-lg">
      <TypedDataTable<Liquidation>
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
    </div>
  );
}
