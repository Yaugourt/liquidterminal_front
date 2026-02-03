import { memo, useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { useStakingHoldersPaginated } from "@/services/explorer/validator";
import { useNumberFormat } from "@/store/number-format.store";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableEmptyState, TableLoadingState } from "@/components/ui/table-states";
import { ErrorState } from "@/components/ui/error-state";
import { ScrollableTable } from "@/components/common/ScrollableTable";
import { usePagination } from "@/hooks/core/usePagination";
import Link from "next/link";



export const StakersTable = memo(function StakersTable() {
  const {
    page: currentPage,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange
  } = usePagination({ initialRowsPerPage: 25 });
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
    onPageChange(newPage);
    updateParams({ page: newPage + 1 });
  }, [updateParams, onPageChange]);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    onRowsPerPageChange(newRowsPerPage);
    updateParams({ limit: newRowsPerPage, page: 1 });
  }, [updateParams, onRowsPerPageChange]);

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
      <ErrorState
        title="Error loading stakers"
        message={error.message}
        withCard={false}
      />
    );
  }

  return (
    <ScrollableTable
      pagination={!isLoading && holders.length > 0 ? {
        total,
        page: currentPage,
        rowsPerPage,
        onPageChange: handlePageChange,
        onRowsPerPageChange: handleRowsPerPageChange,
        rowsPerPageOptions: [10, 25, 50, 100],
      } : undefined}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4">Address</TableHead>
            <TableHead className="px-4">Amount</TableHead>
            <TableHead className="px-4 w-48">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableLoadingState colSpan={3} rows={5} />
          ) : holders.length === 0 ? (
            <TableEmptyState colSpan={3} title="No stakers found" description="Check back later" />
          ) : (
            holders.map((holder, index) => {
              const rank = (currentPage * rowsPerPage) + index + 1;
              const value = hypePrice ? holder.amount * hypePrice : 0;

              return (
                <TableRow
                  key={holder.address}
                  className="hover:bg-white/[0.02]"
                >
                  <TableCell className="px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {rank}.
                      </span>
                      <Link
                        href={`/explorer/address/${holder.address}`}
                        className="text-brand-accent hover:text-white transition-colors font-mono"
                        title="View address details"
                      >
                        {formatAddress(holder.address)}
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(holder.address)}
                        className="h-6 w-6 p-0 hover:bg-white/5 text-text-secondary hover:text-brand-gold"
                      >
                        {copiedAddress === holder.address ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3 text-brand-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
                        )}
                      </Button>

                    </div>
                  </TableCell>
                  <TableCell className="px-4">
                    <span className="inline-block">
                      {formatNumber(holder.amount, format)} HYPE
                    </span>
                  </TableCell>
                  <TableCell className="px-4 w-48">
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
    </ScrollableTable>
  );
});