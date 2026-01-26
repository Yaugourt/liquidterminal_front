import { memo, useState, useEffect } from "react";
import { Loader2, Database, Copy, Check } from "lucide-react";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Pagination } from "@/components/common/pagination";
import { TwapTableProps, TwapTableData } from "./types";
import Link from "next/link";

// Types for real-time data
interface RealTimeData {
  progression: number;
  remainingValue: number;
  remainingAmount: number;
  isCompleted: boolean;
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Composant pour les headers de tableau
const TableHeaderButtonComponent = ({ header, align }: { header: string; align?: string }) => (
  <span className={`text-label text-text-secondary block w-full ${align === 'right' ? 'text-right' : 'text-left'}`}>
    {header}
  </span>
);

const TableHeaderButton = memo(TableHeaderButtonComponent);
TableHeaderButton.displayName = 'TableHeaderButton';

// Utility function to calculate real-time TWAP progression
const calculateRealTimeProgression = (twap: TwapTableData): RealTimeData => {
  const startTime = twap.time;
  const durationMs = twap.duration * 60 * 1000; // minutes to ms
  const currentTime = Date.now();
  const elapsedTime = currentTime - startTime;

  // Calculate smooth progression based on elapsed time (not suborders)
  const timeProgressionPercent = Math.min(100, Math.max(0, (elapsedTime / durationMs) * 100));

  // Calculate remaining quantity and value based on smooth time progression
  const remainingPercent = Math.max(0, 100 - timeProgressionPercent);
  const originalAmount = parseFloat(twap.amount);
  const remainingAmount = originalAmount * (remainingPercent / 100);

  // For value calculation, use the remaining amount with current token price
  const remainingValue = remainingAmount * (twap.value / parseFloat(twap.amount));

  return {
    progression: timeProgressionPercent,
    remainingValue: Math.max(0, remainingValue),
    remainingAmount: remainingAmount,
    isCompleted: timeProgressionPercent >= 100
  };
};

// Composant mémorisé pour la cellule Value unifiée (Type + Value)
const ValueCellComponent = ({ twap, realTimeData, format }: { twap: TwapTableData, realTimeData: Map<string, RealTimeData>, format: NumberFormatType }) => {
  const realTime = realTimeData.get(twap.id);
  const value = realTime ? realTime.remainingValue : twap.value;

  return (
    <TableCell className="py-3 px-3 text-sm text-white font-medium w-[200px]">
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
const TokenCellComponent = ({ twap, realTimeData, format }: { twap: TwapTableData, realTimeData: Map<string, RealTimeData>, format: NumberFormatType }) => {
  const realTime = realTimeData.get(twap.id);
  const displayAmount = realTime ? realTime.remainingAmount : parseFloat(twap.amount);

  return (
    <TableCell className="py-3 px-4 text-sm text-white/80 w-[180px]">
      <span className="text-white font-medium">{formatNumber(displayAmount, format)}</span> {twap.token}
    </TableCell>
  );
};

const TokenCell = memo(TokenCellComponent);
TokenCell.displayName = 'TokenCell';

// Composant mémorisé pour la cellule Progression (dynamique)
const ProgressionCell = memo(({ twap, realTimeData }: { twap: TwapTableData, realTimeData: Map<string, RealTimeData> }) => {
  const realTime = realTimeData.get(twap.id);
  const progression = realTime ? realTime.progression : twap.progression;
  const roundedProgression = Math.round(progression * 100) / 100;

  const getRemainingTime = () => {
    const startTime = twap.time;
    const durationMs = twap.duration * 60 * 1000;
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const remainingMs = Math.max(0, durationMs - elapsedTime);

    if (remainingMs === 0) return "Completed";

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getProgressColor = (progression: number) => {
    if (progression < 30) return "bg-emerald-500";
    if (progression < 70) return "bg-emerald-400";
    return "bg-emerald-300";
  };

  return (
    <TableCell className="py-3 px-3 text-sm text-white w-[160px]">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between w-[120px]">
          <span className="text-label text-text-muted">
            {getRemainingTime()}
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
  <TableCell className="py-3 px-3 text-sm w-[170px]">
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
          <Copy className="h-3 w-3 text-text-muted group-hover:text-white transition-all duration-200" />
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
  const [realTimeData, setRealTimeData] = useState<Map<string, RealTimeData>>(new Map());

  // Real-time update effect
  useEffect(() => {
    if (!twaps || twaps.length === 0) return;

    const updateRealTimeData = () => {
      const newRealTimeData = new Map();

      twaps.forEach(twap => {
        // Only update active TWAP orders (not completed, cancelled, or errored)
        if (!twap.ended && !twap.error) {
          const realTimeCalc = calculateRealTimeProgression(twap);
          newRealTimeData.set(twap.id, realTimeCalc);
        }
      });

      setRealTimeData(newRealTimeData);
    };

    // Initial calculation
    updateRealTimeData();

    // Update every 50ms for ultra real-time precision
    const interval = setInterval(updateRealTimeData, 50);

    return () => clearInterval(interval);
  }, [twaps]);

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
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
            <span className="text-text-muted text-sm">Chargement...</span>
          </div>
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
        <div className="flex flex-col h-full">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex-1">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="border-b border-border-subtle hover:bg-transparent">
                  <TableHead className="py-3 px-3 w-[200px]">
                    <TableHeaderButton header="Value" align="left" />
                  </TableHead>
                  <TableHead className="py-3 px-4 w-[180px]">
                    <TableHeaderButton header="Token" align="left" />
                  </TableHead>
                  <TableHead className="py-3 px-3 w-[170px]">
                    <TableHeaderButton header="User" align="left" />
                  </TableHead>
                  <TableHead className="py-3 px-3 w-[160px]">
                    <TableHeaderButton header="Progression" align="left" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {twaps.length > 0 ? (
                  twaps.map((twap) => (
                    <TableRow
                      key={twap.id}
                      className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors"
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
          </div>

          {showPagination && total > 0 && onPageChange && onRowsPerPageChange && (
            <div className="border-t border-border-subtle px-4 py-3">
              <Pagination
                total={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                rowsPerPageOptions={[5, 10, 15, 20]}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});
TwapTable.displayName = 'TwapTable';
