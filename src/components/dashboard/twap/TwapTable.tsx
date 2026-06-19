import { memo, useState } from "react";
import { Copy, Check } from "lucide-react";
import { TypedDataTable, TokenAvatar, type Column } from "@/components/common";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { StatusBadge } from "@/components/ui/status-badge";
import { getRemainingTime, useTwapRealTime, type TwapRealTimeData } from "@/services/market/order";
import { TwapTableProps, TwapTableData } from "./types";
import Link from "next/link";

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// ─── Memo'd cell sub-components (preserve real-time update isolation) ──

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
    <div className="flex items-center gap-2">
      <StatusBadge variant={twap.type === "Buy" ? "success" : "error"}>
        {twap.type}
      </StatusBadge>
      <span className="text-text-primary font-medium">
        ${formatNumber(value, format)}
      </span>
    </div>
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
    <span className="inline-flex items-center gap-1.5 text-text-secondary text-sm">
      <TokenAvatar assetName={twap.token} size="sm" />
      <span className="text-text-primary font-medium">
        {formatNumber(displayAmount, format)}
      </span>{" "}
      <span>{twap.token}</span>
    </span>
  );
};
const TokenCell = memo(TokenCellComponent);
TokenCell.displayName = "TokenCell";

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

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between w-[120px]">
        <span className="text-label text-text-tertiary">{getRemainingTime(twap)}</span>
        <span className="text-label text-text-primary">
          {roundedProgression.toFixed(1)}%
        </span>
      </div>
      <div className="flex items-center">
        <div className="w-[120px] bg-surface-2 rounded-full h-1">
          <div
            className="h-full rounded-full bg-success transition-all duration-300"
            style={{ width: `${roundedProgression}%` }}
          />
        </div>
      </div>
    </div>
  );
};
const ProgressionCell = memo(ProgressionCellComponent);
ProgressionCell.displayName = "ProgressionCell";

const UserCellComponent = ({
  twap,
  copiedAddress,
  copyToClipboard,
}: {
  twap: TwapTableData;
  copiedAddress: string | null;
  copyToClipboard: (text: string) => void;
}) => (
  <div className="flex items-center gap-1.5">
    <Link
      href={`/explorer/address/${twap.user}`}
      className="text-brand font-mono text-xs hover:text-text-primary transition-colors"
    >
      {formatAddress(twap.user)}
    </Link>
    <button
      onClick={(e) => {
        e.preventDefault();
        copyToClipboard(twap.user);
      }}
      className="group p-1 rounded transition-colors"
    >
      {copiedAddress === twap.user ? (
        <Check className="h-3 w-3 text-success transition-all duration-200" />
      ) : (
        <Copy className="h-3 w-3 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
      )}
    </button>
  </div>
);
const UserCell = memo(UserCellComponent);
UserCell.displayName = "UserCell";

// ─── Main table ──────────────────────────────────────────────────────

function buildColumns(
  format: NumberFormatType,
  realTimeData: Map<string, TwapRealTimeData>,
  copiedAddress: string | null,
  copyToClipboard: (text: string) => void,
): Column<TwapTableData>[] {
  return [
    {
      key: "value",
      header: "Value",
      accessor: (twap) => (
        <ValueCell twap={twap} realTimeData={realTimeData} format={format} />
      ),
      className: "w-[200px]",
    },
    {
      key: "token",
      header: "Token",
      accessor: (twap) => (
        <TokenCell twap={twap} realTimeData={realTimeData} format={format} />
      ),
      className: "px-4 w-[180px]",
    },
    {
      key: "user",
      header: "User",
      accessor: (twap) => (
        <UserCell
          twap={twap}
          copiedAddress={copiedAddress}
          copyToClipboard={copyToClipboard}
        />
      ),
      className: "w-[170px]",
    },
    {
      key: "progression",
      header: "Progression",
      accessor: (twap) => (
        <ProgressionCell twap={twap} realTimeData={realTimeData} />
      ),
      className: "w-[160px]",
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
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
    const { format } = useNumberFormat();
    const realTimeData = useTwapRealTime(twaps);

    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedAddress(text);
        setTimeout(() => setCopiedAddress(null), 2000);
      } catch {
        // Error handled silently
      }
    };

    const columns = buildColumns(format, realTimeData, copiedAddress, copyToClipboard);

    return (
      <TypedDataTable<TwapTableData>
        data={twaps}
        columns={columns}
        getRowKey={(row) => row.id}
        isLoading={isLoading}
        error={error}
        errorTitle="Une erreur est survenue"
        emptyMessage="No active TWAP orders found"
        emptyDescription="Come later"
        // Server-controlled pagination
        total={showPagination && total > 0 ? total : undefined}
        page={showPagination && total > 0 ? page : undefined}
        rowsPerPage={showPagination && total > 0 ? rowsPerPage : undefined}
        onPageChange={showPagination && total > 0 ? onPageChange : undefined}
        onRowsPerPageChange={
          showPagination && total > 0 ? onRowsPerPageChange : undefined
        }
        rowsPerPageOptions={[5, 10, 15, 20]}
      />
    );
  },
);

TwapTable.displayName = "TwapTable";
