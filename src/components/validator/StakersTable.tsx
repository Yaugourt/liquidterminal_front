import { memo, useState, useCallback } from "react";
import { Copy, Database, Check } from "lucide-react";
import { useStakingHoldersPaginated } from "@/services/validator";
import { useNumberFormat } from "@/store/number-format.store";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";
import { formatNumber } from "@/lib/numberFormatting";
import { Button } from "@/components/ui/button";
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

// Composant pour l'en-tête de colonne
const TableHeaderCell = memo(({ label, className, align = "left" }: { label: string; className?: string; align?: "left" | "right" | "center" }) => (
  <TableHead className={className}>
    <Button
      variant="ghost"
      className={`text-white hover:text-white font-inter font-normal p-0 flex items-center w-full ${
        align === 'right' ? 'justify-end text-right' : 
        align === 'center' ? 'justify-center text-center' : 
        'justify-start text-left'
      }`}
    >
      {label}
    </Button>
  </TableHead>
));
TableHeaderCell.displayName = 'TableHeaderCell';

// Composant pour l'état vide
const EmptyState = memo(() => (
  <TableRow>
    <TableCell colSpan={3} className="text-center py-8">
      <div className="flex flex-col items-center justify-center">
        <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
        <p className="text-white text-lg font-inter">No stakers found</p>
        <p className="text-[#FFFFFF80] text-sm font-inter mt-2">Check back later</p>
      </div>
    </TableCell>
  </TableRow>
));
EmptyState.displayName = 'EmptyState';

// Composant pour l'état de chargement
const LoadingState = memo(() => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={i} className="border-b border-[#FFFFFF1A]">
        <TableCell className="py-3 px-4">
          <div className="h-4 bg-[#FFFFFF1A] rounded animate-pulse"></div>
        </TableCell>
        <TableCell className="py-3 px-4">
          <div className="h-4 bg-[#FFFFFF1A] rounded animate-pulse"></div>
        </TableCell>
        <TableCell className="py-3 px-4">
          <div className="h-4 bg-[#FFFFFF1A] rounded animate-pulse"></div>
        </TableCell>
      </TableRow>
    ))}
  </>
));
LoadingState.displayName = 'LoadingState';

export const StakersTable = memo(function StakersTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { format } = useNumberFormat();
  const { price: hypePrice } = useHypePrice();

  const { 
    holders, 
    total, 
    isLoading, 
    error,
    updateParams 
  } = useStakingHoldersPaginated({
    limit: rowsPerPage,
    defaultParams: { page: currentPage + 1 }
  });

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    updateParams({ page: newPage + 1 });
  }, [updateParams]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(0);
    updateParams({ limit: newRowsPerPage, page: 1 });
  }, [updateParams]);

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
          } catch {
        // Error handled silently
      }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <div className="flex flex-col items-center text-center px-4">
          <Database className="w-12 h-12 mb-4 text-[#83E9FF4D]" />
          <p className="text-[#FF5757] text-lg font-inter mb-2">Error loading stakers</p>
          <p className="text-[#FFFFFF80] text-sm font-inter">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-none bg-[#051728]">
              <TableHead className="text-left py-3 px-4 font-normal text-white text-sm font-inter">Address</TableHead>
              <TableHead className="text-left py-3 pl-4 pr-4 font-normal text-white text-sm font-inter">Amount</TableHead>
              <TableHead className="text-left py-3 px-4 font-normal text-white w-48 text-sm font-inter">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-[#051728]">
            {isLoading ? (
              <LoadingState />
            ) : holders.length === 0 ? (
              <EmptyState />
            ) : (
              holders.map((holder, index) => {
                const rank = (currentPage * rowsPerPage) + index + 1;
                const value = hypePrice ? holder.amount * hypePrice : 0;
                
                return (
                  <TableRow
                    key={holder.address}
                    className="border-b border-[#FFFFFF1A] hover:bg-[#FFFFFF0A] transition-colors"
                  >
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-inter font-medium text-sm">
                          {rank}.
                        </span>
                        <Link
                          href={`/explorer/address/${holder.address}`}
                          className="text-[#83E9FF] hover:text-white transition-colors text-sm font-inter"
                          title="View address details"
                        >
                          {formatAddress(holder.address)}
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(holder.address)}
                          className="h-6 w-6 p-0 hover:bg-[#FFFFFF1A]"
                        >
                          {copiedAddress === holder.address ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 text-[#f9e370]" />
                          )}
                        </Button>
            
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-left text-white text-sm font-inter">
                      <span className="inline-block">
                        {formatNumber(holder.amount, format)} HYPE
                      </span>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-left text-white w-48 text-sm font-inter">
                      <span className="inline-block">
                        {hypePrice ? `$${formatNumber(value, format)}` : '-'}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!isLoading && holders.length > 0 && (
        <div className="border-t border-[#FFFFFF1A] px-4 py-3 bg-[#051728]">
          <Pagination
            total={total}
            page={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </div>
      )}
    </div>
  );
}); 