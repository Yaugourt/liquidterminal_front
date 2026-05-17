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
import { TwapTableData } from "@/services/explorer/address/types";
import { getRemainingTime, useTwapRealTime, type TwapRealTimeData } from "@/services/market/order";
import Link from "next/link";

// Composant mémorisé pour la cellule Value (dynamique)
const ValueCellComponent = ({ twap, realTimeData, format }: { twap: TwapTableData, realTimeData: Map<string, TwapRealTimeData>, format: NumberFormatType }) => {
  const realTime = realTimeData.get(twap.id);
  const value = realTime ? realTime.remainingValue : twap.value;

  return (
    <TableCell className="py-3 px-4 text-sm text-text-primary font-medium w-[150px]">
      ${formatNumber(value, format)}
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
    <TableCell className="py-3 px-4 text-sm text-text-primary w-[180px]">
      {formatNumber(displayAmount, format)} {twap.token}
    </TableCell>
  );
};

const TokenCell = memo(TokenCellComponent);
TokenCell.displayName = 'TokenCell';

// Composant mémorisé pour la cellule Hash (statique)
const HashCellComponent = ({ twap, copiedHash, copyToClipboard }: {
  twap: TwapTableData,
  copiedHash: string | null,
  copyToClipboard: (text: string) => void
}) => {
  const formatHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  return (
    <TableCell className="py-3 px-4 text-sm w-[180px]">
      <div className="flex items-center gap-1.5">
        <Link
          href={`/explorer/transaction/${twap.hash}`}
          className="text-brand-accent font-inter hover:text-brand-accent/80 transition-colors"
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
            <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
          )}
        </button>
      </div>
    </TableCell>
  );
};

const HashCell = memo(HashCellComponent);
HashCell.displayName = 'HashCell';

// Composant mémorisé pour la cellule Progression (dynamique)
const ProgressionCellComponent = ({ twap, realTimeData }: { twap: TwapTableData, realTimeData: Map<string, TwapRealTimeData> }) => {
  const realTime = realTimeData.get(twap.id);
  const progression = realTime ? realTime.progression : twap.progression;
  const roundedProgression = Math.round(progression * 100) / 100;

  const getProgressColor = (progression: number) => {
    if (progression < 30) return "bg-red-500";
    if (progression < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <TableCell className="py-3 px-4 text-sm text-text-primary w-[170px]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between w-[120px]">
          <span className="text-xs text-white/50 font-inter">
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
    </TableCell>
  );
};

const ProgressionCell = memo(ProgressionCellComponent);
ProgressionCell.displayName = 'ProgressionCell';

// Composant mémorisé pour la cellule Type (statique)
const TypeCellComponent = ({ twap }: { twap: TwapTableData }) => (
  <TableCell className="py-3 px-4 text-sm text-text-primary w-[80px]">
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${twap.type === 'Buy'
          ? 'bg-emerald-500/10 text-emerald-400'
          : 'bg-rose-500/10 text-rose-400'
        }`}
    >
      {twap.type}
    </span>
  </TableCell>
);

const TypeCell = memo(TypeCellComponent);
TypeCell.displayName = 'TypeCell';

interface UserTwapTableProps {
  twaps: TwapTableData[];
  isLoading: boolean;
  error: Error | null;
}

const UserTwapTableComponent = ({ twaps, isLoading, error }: UserTwapTableProps) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const { format } = useNumberFormat();
  const realTimeData = useTwapRealTime(twaps);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHash(text);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch {
      // Error handled silently
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <LoadingState message="Loading..." size="sm" withCard={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-8 h-8 mb-3 text-brand-accent/30" />
          <p className="text-rose-400 text-sm mb-1">Une erreur est survenue</p>
          <p className="text-white/50 text-xs">Veuillez réessayer plus tard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto scrollbar-brand">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="border-b border-border-subtle hover:bg-transparent">
              <TableHead className="py-3 px-4 w-[80px]">
                <TableHeadLabel>Type</TableHeadLabel>
              </TableHead>
              <TableHead className="py-3 px-4 w-[150px]">
                <TableHeadLabel>Value</TableHeadLabel>
              </TableHead>
              <TableHead className="py-3 px-4 w-[180px]">
                <TableHeadLabel>Token</TableHeadLabel>
              </TableHead>
              <TableHead className="py-3 px-4 w-[180px]">
                <TableHeadLabel>Hash</TableHeadLabel>
              </TableHead>
              <TableHead className="py-3 px-4 w-[170px]">
                <TableHeadLabel>Progression</TableHeadLabel>
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
                  <TypeCell twap={twap} />
                  <ValueCell twap={twap} realTimeData={realTimeData} format={format} />
                  <TokenCell twap={twap} realTimeData={realTimeData} format={format} />
                  <HashCell twap={twap} copiedHash={copiedHash} copyToClipboard={copyToClipboard} />
                  <ProgressionCell twap={twap} realTimeData={realTimeData} />
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <Database className="w-10 h-10 mb-3 text-brand-accent/30" />
                    <p className="text-text-primary text-sm mb-1">No active TWAP orders found</p>
                    <p className="text-white/50 text-xs">Come later</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export const UserTwapTable = memo(UserTwapTableComponent);
UserTwapTable.displayName = 'UserTwapTable';