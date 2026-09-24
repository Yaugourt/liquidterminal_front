import { memo, useCallback } from "react";
import { useStakingHoldersPaginated } from "@/services/explorer/validator";
import { useNumberFormat } from "@/store/number-format.store";
import { useHypeLivePrice } from "@/services/market/hype/hooks/useHypePrice";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { AddressDisplay } from "@/components/ui/address-display";
import { TypedDataTable, type Column } from "@/components/common";
import { usePagination } from "@/hooks/core/usePagination";

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
  const { format } = useNumberFormat();
  const hypePrice = useHypeLivePrice();

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

  const columns: Column<StakerRow>[] = [
    {
      key: "rank",
      header: "#",
      type: "rank",
      accessor: (_holder, index) => currentPage * rowsPerPage + index + 1,
    },
    {
      key: "address",
      header: "Address",
      accessor: (holder) => <AddressDisplay address={holder.address} />,
    },
    {
      key: "amount",
      header: "Amount",
      type: "numeric",
      accessor: (holder) => `${formatNumber(holder.amount, format)} HYPE`,
    },
    {
      key: "value",
      header: "Value",
      type: "numeric",
      width: "12rem",
      accessor: (holder) =>
        hypePrice ? `$${formatNumber(holder.amount * hypePrice, format)}` : "—",
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
      density="compact"
    />
  );
});
