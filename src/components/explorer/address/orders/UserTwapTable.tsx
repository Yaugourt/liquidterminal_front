"use client";

import { memo, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { TypedDataTable, type Column } from "@/components/common";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { TwapTableData } from "@/services/explorer/address/types";
import {
  getRemainingTime,
  useTwapRealTime,
  type TwapRealTimeData,
} from "@/services/market/order";

// ─── Memo'd cells (each subscribes only to what it needs, so 50ms ticks
//     re-render the dynamic value/token/progression cells while leaving the
//     static type/hash cells untouched) ─────────────────────────────────

const ValueCellComponent = ({
  twap,
  realTimeData,
  format,
}: {
  twap: TwapTableData;
  realTimeData: Map<string, TwapRealTimeData>;
  format: NumberFormatType;
}) => {
  const realTime = realTimeData.get(twap.id);
  const value = realTime ? realTime.remainingValue : twap.value;
  return (
    <span className="text-text-primary font-medium">
      ${formatNumber(value, format)}
    </span>
  );
};
const ValueCell = memo(ValueCellComponent);
ValueCell.displayName = "ValueCell";

const TokenCellComponent = ({
  twap,
  realTimeData,
  format,
}: {
  twap: TwapTableData;
  realTimeData: Map<string, TwapRealTimeData>;
  format: NumberFormatType;
}) => {
  const realTime = realTimeData.get(twap.id);
  const displayAmount = realTime
    ? realTime.remainingAmount
    : parseFloat(twap.amount);
  return (
    <span className="text-text-primary">
      {formatNumber(displayAmount, format)} {twap.token}
    </span>
  );
};
const TokenCell = memo(TokenCellComponent);
TokenCell.displayName = "TokenCell";

const HashCellComponent = ({
  twap,
  copiedHash,
  copyToClipboard,
}: {
  twap: TwapTableData;
  copiedHash: string | null;
  copyToClipboard: (text: string) => void;
}) => {
  const formatHash = (hash: string) => `${hash.slice(0, 6)}...${hash.slice(-4)}`;

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/explorer/transaction/${twap.hash}`}
        className="text-brand font-inter hover:text-brand/80 transition-colors"
      >
        {formatHash(twap.hash)}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          copyToClipboard(twap.hash);
        }}
        className="group p-1 rounded transition-colors"
      >
        {copiedHash === twap.hash ? (
          <Check className="h-3.5 w-3.5 text-success transition-all duration-200" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
        )}
      </button>
    </div>
  );
};
const HashCell = memo(HashCellComponent);
HashCell.displayName = "HashCell";

const ProgressionCellComponent = ({
  twap,
  realTimeData,
}: {
  twap: TwapTableData;
  realTimeData: Map<string, TwapRealTimeData>;
}) => {
  const realTime = realTimeData.get(twap.id);
  const progression = realTime ? realTime.progression : twap.progression;
  const roundedProgression = Math.round(progression * 100) / 100;

  // Progression bar colour ramp — preserves the legacy red/yellow/green palette.
  const getProgressColor = (p: number) => {
    if (p < 30) return "bg-danger";
    if (p < 70) return "bg-gold";
    return "bg-success";
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between w-[120px]">
        <span className="text-xs text-text-tertiary font-inter">
          {getRemainingTime(twap)}
        </span>
        <span className="text-xs text-text-primary">
          {roundedProgression.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center">
        <div className="w-[120px] bg-white/10 rounded-full h-1.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(roundedProgression)}`}
            style={{ width: `${roundedProgression}%` }}
          />
        </div>
      </div>
    </div>
  );
};
const ProgressionCell = memo(ProgressionCellComponent);
ProgressionCell.displayName = "ProgressionCell";

const TypeCellComponent = ({ twap }: { twap: TwapTableData }) => (
  <span
    className={`px-2 py-1 rounded text-xs font-medium ${
      twap.type === "Buy"
        ? "bg-success/10 text-success"
        : "bg-danger/10 text-danger"
    }`}
  >
    {twap.type}
  </span>
);
const TypeCell = memo(TypeCellComponent);
TypeCell.displayName = "TypeCell";

interface UserTwapTableProps {
  twaps: TwapTableData[];
  isLoading: boolean;
  error: Error | null;
}

const UserTwapTableComponent = ({
  twaps,
  isLoading,
  error,
}: UserTwapTableProps) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const { format } = useNumberFormat();
  const realTimeData = useTwapRealTime(twaps);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch {
      // Silently ignore clipboard errors.
    }
  };

  const columns: Column<TwapTableData>[] = useMemo(
    () => [
      {
        key: "type",
        header: "Type",
        width: "80px",
        accessor: (twap) => <TypeCell twap={twap} />,
      },
      {
        key: "value",
        header: "Value",
        width: "150px",
        accessor: (twap) => (
          <ValueCell twap={twap} realTimeData={realTimeData} format={format} />
        ),
      },
      {
        key: "token",
        header: "Token",
        width: "180px",
        accessor: (twap) => (
          <TokenCell twap={twap} realTimeData={realTimeData} format={format} />
        ),
      },
      {
        key: "hash",
        header: "Hash",
        width: "180px",
        accessor: (twap) => (
          <HashCell
            twap={twap}
            copiedHash={copiedHash}
            copyToClipboard={copyToClipboard}
          />
        ),
      },
      {
        key: "progression",
        header: "Progression",
        width: "170px",
        accessor: (twap) => (
          <ProgressionCell twap={twap} realTimeData={realTimeData} />
        ),
      },
    ],
    [realTimeData, format, copiedHash]
  );

  return (
    <TypedDataTable<TwapTableData>
      data={twaps}
      columns={columns}
      getRowKey={(twap) => twap.id}
      isLoading={isLoading}
      error={error}
      errorTitle="Une erreur est survenue"
      emptyMessage="No active TWAP orders found"
      emptyDescription="Come later"
      density="comfortable"
      fixedLayout
    />
  );
};

export const UserTwapTable = memo(UserTwapTableComponent);
UserTwapTable.displayName = "UserTwapTable";
