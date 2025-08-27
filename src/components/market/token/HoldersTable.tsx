"use client";

import { memo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Loader2, Database, Copy, Check } from "lucide-react";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useGlobalAliases } from "@/services/explorer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/common/pagination";
import Link from "next/link";

interface HoldersTableProps {
  holders: Record<string, number>;
  isLoading: boolean;
  error: Error | null;
  tokenName: string;
  tokenPrice?: number; // Prix du token pour calculer la valeur
  maxSupply?: number; // Max supply pour calculer le pourcentage
  stakedHolders?: Record<string, number>; // Holders stakés pour identifier les adresses stakées
}

const formatAddress = (address: string) => {
  if (!address || address.length <= 20) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatPercentage = (amount: number, totalSupply: number, format: NumberFormatType) => {
  if (totalSupply === 0) return "0%";
  const percentage = (amount / totalSupply) * 100;
  return `${formatNumber(percentage, format, { maximumFractionDigits: 2 })}%`;
};

export const HoldersTable = memo(({ holders, isLoading, error, tokenPrice, maxSupply, stakedHolders }: HoldersTableProps) => {
  const { format } = useNumberFormat();
  const { getAlias } = useGlobalAliases();
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Convertir les holders en tableau et trier par montant décroissant
  const holdersArray = Object.entries(holders)
    .map(([address, amount]) => ({ address, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Calculer le total supply à partir des holders
  const totalSupply = holdersArray.reduce((sum, holder) => sum + holder.amount, 0);

  // Pagination
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedHolders = holdersArray.slice(startIndex, endIndex);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      // Error handled silently
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#83E9FF] mb-2" />
          <span className="text-[#FFFFFF80] text-sm">Loading holders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[200px]">
        <div className="flex flex-col items-center">
          <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
          <p className="text-white text-sm mb-1">Error loading holders</p>
          <p className="text-[#FFFFFF80] text-xs">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent">
        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHead className="py-3 px-3 w-[170px] text-white font-normal text-sm text-left">Address</TableHead>
              <TableHead className="py-3 px-3 w-[120px] text-white font-normal text-sm text-left">Amount</TableHead>
              <TableHead className="py-3 px-3 w-[120px] text-white font-normal text-sm text-left">Value</TableHead>
              <TableHead className="py-3 px-3 w-[80px] text-white font-normal text-sm text-left">Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {paginatedHolders.length > 0 ? (
              paginatedHolders.map((holder, index) => (
                <TableRow
                  key={holder.address}
                  className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors"
                >
                  <TableCell className="py-3 px-3 w-[170px] text-white text-sm text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-white text-sm">{startIndex + index + 1}.</span>
                      <div className="flex items-center gap-1">
                        <Link 
                          href={`/explorer/address/${holder.address}`} 
                          className="text-[#83E9FF] font-inter hover:text-[#83E9FF]/80 transition-colors"
                        >
                          {formatAddress(holder.address)}
                        </Link>
                        {getAlias(holder.address) && (
                          <span className="text-gray-400 text-xs ml-1">
                            ({getAlias(holder.address)})
                          </span>
                        )}
                        <button 
                          onClick={() => copyToClipboard(holder.address)}
                          className="group p-1 rounded transition-colors"
                        >
                          {copiedAddress === holder.address ? (
                            <Check className="h-3.5 w-3.5 text-green-500 transition-all duration-200" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100 transition-all duration-200" />
                          )}
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-3 w-[120px] text-white text-sm text-left">
                    <div className="flex items-center gap-1">
                      <span>{formatNumber(holder.amount, format, { maximumFractionDigits: 2 })}</span>
                      {stakedHolders && stakedHolders[holder.address] && (
                        <span className="text-[#f9e370] text-xs">
                          (staked)
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-3 w-[120px] text-white text-sm text-left">
                    {tokenPrice ? `$${formatNumber(holder.amount * tokenPrice, format, { maximumFractionDigits: 2 })}` : 'N/A'}
                  </TableCell>
                  <TableCell className="py-3 px-3 w-[80px] text-white text-sm text-left">
                    {formatPercentage(holder.amount, totalSupply, format)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-8"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <Database className="w-10 h-10 mb-3 text-[#83E9FF4D]" />
                    <p className="text-white text-sm mb-1">No holders found</p>
                    <p className="text-[#FFFFFF80] text-xs">No data available</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {holdersArray.length > 0 && (
        <div className="border-t border-[#FFFFFF1A] px-4 py-3 bg-[#051728]">
          <Pagination
            total={holdersArray.length}
            page={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </div>
      )}
    </Card>
  );
});

HoldersTable.displayName = 'HoldersTable';
