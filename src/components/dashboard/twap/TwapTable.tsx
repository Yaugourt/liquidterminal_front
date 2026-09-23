import { memo } from "react";
import {
  TypedDataTable,
  ModuleAsset,
  SideBadge,
  CellValue,
  CellBar,
  toTradeSide,
  type Column,
} from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { getRemainingTime, useTwapRealTime, type TwapRealTimeData } from "@/services/market/order";
import { TwapTableProps, TwapTableData } from "./types";

/** Fill bar + percentage over the remaining time. */
function ProgressCell({ progression, remaining }: { progression: number; remaining: string }) {
  const pct = Math.round(progression * 100) / 100;
  return (
    <CellBar
      align="left"
      width={96}
      value={pct / 100}
      // Completion is time-based, not a direction: one colour, never red.
      tone="success"
      label={<CellValue value={`${pct.toFixed(1)}%`} sub={remaining} align="left" />}
    />
  );
}

// ─── Main table ──────────────────────────────────────────────────────

// Value / amount / progress read the live interpolation (`useTwapRealTime`),
// falling back to the snapshot when the order has no real-time entry.
function buildColumns(
  format: NumberFormatType,
  realTimeData: Map<string, TwapRealTimeData>,
): Column<TwapTableData>[] {
  return [
    {
      key: "side",
      header: "Side",
      accessor: (twap) => {
        const side = toTradeSide(twap.type);
        return side ? <SideBadge side={side} /> : "—";
      },
    },
    {
      key: "value",
      header: "Value",
      type: "numeric",
      accessor: (twap) => {
        const value = realTimeData.get(twap.id)?.remainingValue ?? twap.value;
        return `$${formatNumber(value, format)}`;
      },
    },
    {
      key: "token",
      header: "Token",
      accessor: (twap) => <ModuleAsset assetName={twap.token} name={twap.token} />,
    },
    {
      key: "amount",
      header: "Amount",
      type: "numeric",
      accessor: (twap) => {
        const amount = realTimeData.get(twap.id)?.remainingAmount ?? parseFloat(twap.amount);
        return formatNumber(amount, format);
      },
    },
    {
      key: "user",
      header: "User",
      accessor: (twap) => <AddressDisplay address={twap.user} />,
    },
    {
      key: "progression",
      header: "Progression",
      accessor: (twap) => (
        <ProgressCell
          progression={realTimeData.get(twap.id)?.progression ?? twap.progression}
          remaining={getRemainingTime(twap)}
        />
      ),
    },
  ];
}

export const TwapTable = memo(
  ({
    twaps,
    isLoading,
    error,
    total,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    showPagination,
  }: TwapTableProps) => {
    const { format } = useNumberFormat();
    const realTimeData = useTwapRealTime(twaps);

    const columns = buildColumns(format, realTimeData);
    const paginated = showPagination && total > 0;

    return (
      <TypedDataTable<TwapTableData>
        data={twaps}
        columns={columns}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        error={error}
        errorTitle="Failed to load TWAP orders"
        emptyMessage="No active TWAP orders"
        emptyDescription="Active TWAPs will appear here as soon as one is placed."
        density="compact"
        // Server-controlled pagination
        total={paginated ? total : undefined}
        page={paginated ? page : undefined}
        rowsPerPage={paginated ? rowsPerPage : undefined}
        onPageChange={paginated ? onPageChange : undefined}
        onRowsPerPageChange={paginated ? onRowsPerPageChange : undefined}
        rowsPerPageOptions={[5, 10, 15, 20]}
      />
    );
  },
);

TwapTable.displayName = "TwapTable";
