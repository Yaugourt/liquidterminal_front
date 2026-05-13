import { memo, useState } from "react";
import { Database, Copy, Check } from "lucide-react";
import { LoadingState } from "@/components/ui/loading-state";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableHeadLabel,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { ScrollableTable } from "@/components/common";
import { getRemainingTime, useTwapRealTime, type TwapRealTimeData } from "@/services/market/order";
import { TwapTableProps, TwapTableData } from "./types";
import Link from "next/link";

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Composant mémorisé pour la cellule Value unifiée (Type + Value)
const ValueCellComponent = ({ twap, realTimeData, format }: { twap: TwapTableData, realTimeData: Map<string, TwapRealTimeData>, format: NumberFormatType }) => {
  const realTime = realTimeData.get(twap.id);
  const value = realTime ? realTime.remainingValue : twap.value;

  return (
    <TableCell className="text-sm text-white font-medium w-[200px]">
      <div className="flex items-center gap-2">
        <StatusBadge variant={twap.type === 'Buy' ? 'success' : 'error'}>
          {twap.type}
        </StatusBadge>
        <span className="text-white font-medium">
          ${formatNumber(value, format)}
        </span>
      </div>
    </TableCell>
  );
};

const ValueCell = memo(ValueCellComponent);
ValueCell.displayName = 'ValueCell';

// Composant mémorisé pour la cellule Token (dynamique)
const TokenCellComponent = ({ twap, realTimeData, format }: { twap: TwapTableData, realTimeData: Map<string, TwapRealTimeData>, format: NumberFormatType }) => {
  const realTime = realTimeData.get(twap.id);
  const displayAmount = realTime ? realTime.remainingAmount : parseFloat(twap.amount);

  return (
    <TableCell className="px-4 text-sm text-white/80 w-[180px]">
      <span className="text-white font-medium">{formatNumber(displayAmount, format)}</span> {twap.token}
    </TableCell>
  );
};

const TokenCell = memo(TokenCellComponent);
TokenCell.displayName = 'TokenCell';

// Composant mémorisé pour la cellule Progression (dynamique)
const ProgressionCell = memo(({ twap, realTimeData }: { twap: TwapTableData, realTimeData: Map<string, TwapRealTimeData> }) => {
  const realTime = realTimeData.get(twap.id);
  const progression = realTime ? realTime.progression : twap.progression;
  const roundedProgression = Math.round(progression * 100) / 100;

  const getProgressColor = (progression: number) => {
    if (progression < 30) return "bg-emerald-500";
    if (progression < 70) return "bg-emerald-400";
    return "bg-emerald-300";
  };

  return (
    <TableCell className="text-sm text-white w-[160px]">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between w-[120px]">
          <span className="text-label text-text-muted">
            {getRemainingTime(twap)}
          </span>
          <span className="text-label text-white">
            {roundedProgression.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-[120px] bg-white/10 rounded-full h-1">
            <div
              className={`h-full rounded-full transition-all duration-300 ${getProgressColor(roundedProgression)}`}
              style={{ width: `${roundedProgression}%` }}
            />
          </div>
        </div>
      </div>
    </TableCell>
  );
});
ProgressionCell.displayName = 'ProgressionCell';

// Composant mémorisé pour la cellule User (statique)
const UserCell = memo(({ twap, copiedAddress, copyToClipboard }: {
  twap: TwapTableData,
  copiedAddress: string | null,
  copyToClipboard: (text: string) => void
}) => (
  <TableCell className="text-sm w-[170px]">
    <div className="flex items-center gap-1.5">
      <Link
        href={`/explorer/address/${twap.user}`}
        className="text-brand-accent font-mono text-xs hover:text-white transition-colors"
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
          <Check className="h-3 w-3 text-green-500 transition-all duration-200" />
        ) : (
          <Copy className="h-3 w-3 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
        )}
      </button>
    </div>
  </TableCell>
));
UserCell.displayName = 'UserCell';

export const TwapTable = memo(({
  twaps,
  isLoading,
  error,
  total,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  showPagination
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

  return (
    <div className="w-full h-full flex flex-col">
      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <LoadingState message="Chargement..." size="sm" withCard={false} />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-8 h-8 mb-3 text-red-400" />
            <p className="text-red-400 text-sm mb-1">Une erreur est survenue</p>
            <p className="text-text-muted text-xs">Veuillez réessayer plus tard</p>
          </div>
        </div>
      ) : (
        <ScrollableTable
          pagination={showPagination && total > 0 && onPageChange !== undefined && onRowsPerPageChange !== undefined ? {
            total,
            page,
            rowsPerPage,
            onPageChange,
            onRowsPerPageChange,
            rowsPerPageOptions: [5, 10, 15, 20],
          } : undefined}
        >
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">
                  <TableHeadLabel>Value</TableHeadLabel>
                </TableHead>
                <TableHead className="px-4 w-[180px]">
                  <TableHeadLabel>Token</TableHeadLabel>
                </TableHead>
                <TableHead className="w-[170px]">
                  <TableHeadLabel>User</TableHeadLabel>
                </TableHead>
                <TableHead className="w-[160px]">
                  <TableHeadLabel>Progression</TableHeadLabel>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {twaps.length > 0 ? (
                twaps.map((twap) => (
                  <TableRow
                    key={twap.id}
                    className="hover:bg-white/[0.02]"
                  >
                    <ValueCell twap={twap} realTimeData={realTimeData} format={format} />
                    <TokenCell twap={twap} realTimeData={realTimeData} format={format} />
                    <UserCell twap={twap} copiedAddress={copiedAddress} copyToClipboard={copyToClipboard} />
                    <ProgressionCell twap={twap} realTimeData={realTimeData} />
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 border-none"
                  >
                    <div className="flex flex-col items-center justify-center text-center">
                      <Database className="w-10 h-10 mb-3 text-text-muted" />
                      <p className="text-text-secondary text-sm mb-1">No active TWAP orders found</p>
                      <p className="text-text-muted text-xs">Come later</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollableTable>
      )}
    </div>
  );
});
TwapTable.displayName = 'TwapTable';
