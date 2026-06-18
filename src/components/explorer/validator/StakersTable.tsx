import { memo, useState, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { useStakingHoldersPaginated } from "@/services/explorer/validator";
import { useNumberFormat } from "@/store/number-format.store";
import { useHypePrice } from "@/services/market/hype/hooks/useHypePrice";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { Button } from "@/components/ui/button";
import { TypedDataTable, type Column } from "@/components/common";
import { usePagination } from "@/hooks/core/usePagination";
import Link from "next/link";

interface StakerRow {
  address: string;
  amount: number;
}

export const StakersTable = memo(function StakersTable() {
  const {
    page: currentPage,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
  } = usePagination({ initialRowsPerPage: 25 });
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { format } = useNumberFormat();
  const { price: hypePrice } = useHypePrice();

  const { holders, total, isLoading, error, updateParams } = useStakingHoldersPaginated({
    limit: rowsPerPage,
    defaultParams: { page: currentPage + 1 },
  });

  const handlePageChange = useCallback(
    (newPage: number) => {
      onPageChange(newPage);
      updateParams({ page: newPage + 1 });
    },
    [updateParams, onPageChange]
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage: number) => {
      onRowsPerPageChange(newRowsPerPage);
      updateParams({ limit: newRowsPerPage, page: 1 });
    },
    [updateParams, onRowsPerPageChange]
  );

  const copyToClipboard = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      // Error handled silently
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const columns: Column<StakerRow>[] = [
    {
      key: "address",
      header: "Address",
      accessor: (holder, index) => {
        const rank = currentPage * rowsPerPage + index + 1;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{rank}.</span>
            <Link
              href={`/explorer/address/${holder.address}`}
              className="text-brand hover:text-text-primary transition-colors"
              title="View address details"
            >
              {formatAddress(holder.address)}
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(holder.address)}
              className="h-6 w-6 p-0 hover:bg-surface-2 text-text-secondary hover:text-gold"
            >
              {copiedAddress === holder.address ? (
                <Check className="h-3 w-3 text-success" />
              ) : (
                <Copy className="h-3 w-3 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
              )}
            </Button>
          </div>
        );
      },
    },
    {
      key: "amount",
      header: "Amount",
      accessor: (holder) => (
        <span className="inline-block">
          {formatNumber(holder.amount, format)} HYPE
        </span>
      ),
    },
    {
      key: "value",
      header: "Value",
      width: "12rem",
      accessor: (holder) => {
        const value = hypePrice ? holder.amount * hypePrice : 0;
        return (
          <span className="inline-block">
            {hypePrice ? `$${formatNumber(value, format)}` : "-"}
          </span>
        );
      },
    },
  ];

  return (
    <TypedDataTable<StakerRow>
      data={holders}
      columns={columns}
      getRowKey={(holder) => holder.address}
      isLoading={isLoading}
      error={error}
      errorTitle="Error loading stakers"
      emptyMessage="No stakers found"
      emptyDescription="Check back later"
      total={total}
      page={currentPage}
      rowsPerPage={rowsPerPage}
      onPageChange={handlePageChange}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPageOptions={[10, 25, 50, 100]}
      paginationVariant={!isLoading && holders.length > 0 ? "full" : "none"}
    />
  );
});
