import { memo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Database, Copy, Check } from "lucide-react";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { formatNumber } from "@/lib/numberFormatting";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
  <Button
    variant="ghost"
    className={`text-white hover:text-white text-xs font-medium tracking-wide p-0 h-auto flex items-center transition-colors w-full ${align === 'right' ? 'justify-end text-right' : 'justify-start text-left'}`}
  >
    {header}
  </Button>
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
  
  // For value calculation, reconstruct original value and calculate remaining
  const originalValue = twap.value / (100 - twap.progression) * 100; // Reconstruct original value
  const remainingValue = originalValue * (remainingPercent / 100);
  
  return {
    progression: timeProgressionPercent,
    remainingValue: Math.max(0, remainingValue),
    remainingAmount: remainingAmount,
    isCompleted: timeProgressionPercent >= 100
  };
};

// Composant mémorisé pour la cellule Value (dynamique)
const ValueCellComponent = ({ twap, realTimeData, format }: { twap: TwapTableData, realTimeData: Map<string, RealTimeData>, format: NumberFormatType }) => {
  const realTime = realTimeData.get(twap.id);
  const value = realTime ? realTime.remainingValue : twap.value;
  
  return (
    <TableCell className="py-3 px-4 text-sm text-white font-medium w-[150px]">
      ${formatNumber(value, format)}
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
    <TableCell className="py-3 px-4 text-sm text-white w-[180px]">
      {formatNumber(displayAmount, format)} {twap.token}
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
    if (progression < 30) return "bg-red-500";
    if (progression < 70) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  return (
    <TableCell className="py-3 px-4 text-sm text-white w-[170px]">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between w-[120px]">
          <span className="text-xs text-[#FFFFFF80]  font-inter">
            {getRemainingTime()}
          </span>
          <span className="text-xs text-white">
            {roundedProgression.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center">
          <div className="w-[120px] bg-[#FFFFFF1A] rounded-full h-1.5">
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

// Composant mémorisé pour la cellule Type (statique)
const TypeCell = memo(({ twap }: { twap: TwapTableData }) => (
  <TableCell className="py-3 px-4 text-sm text-white w-[80px]">
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        twap.type === 'Buy'
          ? 'bg-green-500/20 text-green-400'
          : 'bg-red-500/20 text-red-400'
      }`}
    >
      {twap.type}
    </span>
  </TableCell>
));
TypeCell.displayName = 'TypeCell';

// Composant mémorisé pour la cellule User (statique)
const UserCell = memo(({ twap, copiedAddress, copyToClipboard }: { 
  twap: TwapTableData, 
  copiedAddress: string | null, 
  copyToClipboard: (text: string) => void 
}) => (
  <TableCell className="py-3 px-4 text-sm w-[180px]">
    <div className="flex items-center gap-1.5">
      <Link 
        href={`/explorer/address/${twap.user}`}
        className="text-[#83E9FF] font-inter hover:text-[#83E9FF]/80 transition-colors"
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
          <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
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
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg mx-auto">
      {isLoading ? (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
            <span className="text-[#FFFFFF80] text-sm">Chargement...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-[200px]">
          <div className="flex flex-col items-center text-center px-4">
            <Database className="w-8 h-8 mb-3 text-[#83E9FF4D]" />
            <p className="text-[#FF5757] text-sm mb-1">Une erreur est survenue</p>
            <p className="text-[#FFFFFF80] text-xs">Veuillez réessayer plus tard</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent flex-1">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow className="border-none bg-[#051728]">
                  <TableHead className="py-3 px-4 w-[80px]">
                    <TableHeaderButton header="Type" align="left" />
                  </TableHead>
                  <TableHead className="py-3 px-4 w-[150px]">
                    <TableHeaderButton header="Value" align="left" />
                  </TableHead>
                  <TableHead className="py-3 px-4 w-[180px]">
                    <TableHeaderButton header="Token" align="left" />
                  </TableHead>
                  <TableHead className="py-3 px-4 w-[180px]">
                    <TableHeaderButton header="User" align="left" />
                  </TableHead>
                  <TableHead className="py-3 px-4 w-[170px]">
                    <TableHeaderButton header="Progression" align="left" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-[#051728]">
                {twaps.length > 0 ? (
                  twaps.map((twap) => (
                    <TableRow
                      key={twap.id}
                      className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors"
                    >
                      <TypeCell twap={twap} />
                      <ValueCell twap={twap} realTimeData={realTimeData} format={format} />
                      <TokenCell twap={twap} realTimeData={realTimeData} format={format} />
                      <UserCell twap={twap} copiedAddress={copiedAddress} copyToClipboard={copyToClipboard} />
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
                        <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                        <p className="text-white text-sm mb-1">No active TWAP orders found</p>
                        <p className="text-[#FFFFFF80] text-xs">Revenez plus tard</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {showPagination && total > 0 && onPageChange && onRowsPerPageChange && (
            <div className="border-t border-[#FFFFFF1A] px-4 py-3 bg-[#051728]">
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
    </Card>
  );
});
TwapTable.displayName = 'TwapTable';