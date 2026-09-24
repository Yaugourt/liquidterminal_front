"use client";

import { memo, useMemo, type ReactNode } from "react";
import {
  TypedDataTable,
  ModuleAsset,
  SideBadge,
  toTradeSide,
  type Column,
  CellBar,
  type CellBarTone,
} from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { useNumberFormat } from "@/store/number-format.store";
import { formatAssetValue, formatNumber } from "@/lib/formatters/numberFormatting";
import { TwapTableData } from "@/services/explorer/address/types";
import {
  getRemainingTime,
  useTwapRealTime,
} from "@/services/market/order";

/** Progress colour ramp (red → gold → green as the TWAP fills). */
const progressTone = (p: number): CellBarTone => (p < 30 ? "danger" : p < 70 ? "gold" : "success");

/** Execution progress: token-coloured bar + mono percentage. */
const ProgressionCell = memo(function ProgressionCell({ progression }: { progression: number }) {
  const pct = Math.round(progression * 100) / 100;
  return <CellBar value={pct / 100} tone={progressTone(pct)} label={`${pct.toFixed(1)}%`} width={80} />;
});

interface UserTwapTableProps {
  twaps: TwapTableData[];
  isLoading: boolean;
  error: Error | null;
  /** Card head, rendered by the table (`<CardHead>`). */
  title?: string;
  headerAction?: ReactNode;
}

const UserTwapTableComponent = ({
  twaps,
  isLoading,
  error,
  title,
  headerAction,
}: UserTwapTableProps) => {
  const { format } = useNumberFormat();
  // Ticks every second: the value / remaining / progress cells read it live.
  const realTimeData = useTwapRealTime(twaps);

  const columns: Column<TwapTableData>[] = useMemo(
    () => [
      {
        key: "token",
        header: "Token",
        accessor: (twap) => <ModuleAsset assetName={twap.token} name={twap.token} />,
      },
      {
        key: "type",
        header: "Side",
        accessor: (twap) => {
          const side = toTradeSide(twap.type);
          return side ? <SideBadge side={side} /> : "—";
        },
      },
      {
        key: "remaining",
        header: "Remaining",
        type: "numeric",
        accessor: (twap) => {
          const rt = realTimeData.get(twap.id);
          const amount = rt ? rt.remainingAmount : parseFloat(twap.amount);
          return `${formatNumber(amount, format)} ${twap.token}`;
        },
      },
      {
        key: "value",
        header: "Value",
        type: "numeric",
        accessor: (twap) => {
          const rt = realTimeData.get(twap.id);
          return formatAssetValue(rt ? rt.remainingValue : twap.value, format);
        },
      },
      {
        key: "hash",
        header: "Hash",
        className: "max-md:hidden",
        accessor: (twap) => (
          <AddressDisplay
            address={twap.hash}
            href={`/explorer/transaction/${twap.hash}`}
            copyMessage="Hash copied to clipboard"
          />
        ),
      },
      {
        key: "timeLeft",
        header: "Time left",
        type: "time",
        align: "right",
        accessor: (twap) => getRemainingTime(twap),
      },
      {
        key: "progression",
        header: "Progress",
        align: "right",
        accessor: (twap) => (
          <ProgressionCell progression={realTimeData.get(twap.id)?.progression ?? twap.progression} />
        ),
      },
    ],
    [realTimeData, format]
  );

  return (
    <TypedDataTable<TwapTableData>
      title={title}
      tag={twaps.length > 0 ? `${twaps.length} active` : undefined}
      headerAction={headerAction}
      data={twaps}
      columns={columns}
      getRowKey={(twap) => twap.id}
      isLoading={isLoading}
      error={error}
      errorTitle="Failed to load TWAP orders"
      emptyMessage="No active TWAP orders found"
      emptyDescription="Running TWAP orders will appear here."
      density="compact"
    />
  );
};

export const UserTwapTable = memo(UserTwapTableComponent);
UserTwapTable.displayName = "UserTwapTable";
