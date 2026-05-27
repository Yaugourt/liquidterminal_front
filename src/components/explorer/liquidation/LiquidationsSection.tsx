"use client";

import { Liquidation } from "@/services/explorer/liquidation";
import { useNumberFormat } from "@/store/number-format.store";
import { useDateFormat } from "@/store/date-format.store";
import { TypedDataTable, TokenAvatar, type Column } from "@/components/common";
import { StatusBadge } from "@/components/ui/status-badge";
import { AddressDisplay } from "@/components/ui/address-display";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useLiquidationsContext, MIN_AMOUNT_PRESETS } from "./LiquidationsContext";
import { Filter, RefreshCw } from "lucide-react";

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

  const toolbar = (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <h3 className="text-xs text-text-secondary font-semibold uppercase tracking-wider">
          Recent Liquidations
        </h3>
        {lastUpdated && (
          <span className="text-[10px] text-text-tertiary">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}
        <button
          onClick={refreshData}
          className="p-1.5 rounded-md hover-subtle text-text-tertiary hover:text-text-secondary"
          title="Refresh data"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-text-tertiary" />
        <div className="flex bg-base rounded-lg p-0.5 border border-border-subtle">
          {MIN_AMOUNT_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setMinAmount(preset.value)}
              className={`px-2.5 py-1 rounded-md text-label transition-all ${
                minAmount === preset.value
                  ? "bg-brand text-brand-text-on font-bold"
                  : "tab-inactive"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col p-4">
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
