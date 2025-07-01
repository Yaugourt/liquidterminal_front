import { memo, useMemo } from "react";
import {truncateAddress, formatStakeValue, formatTVLValue} from "@/lib/formatting";
import { AuctionsTableProps, ValidatorsTableProps, VaultTableProps } from "@/components/types/dashboard.types";
import { DataTable, Column } from "./DataTable";
import { useNumberFormat } from "@/store/number-format.store";
import Link from "next/link";
import { PriceChange } from '@/components/common';

interface PaginationProps {
  total?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  showPagination?: boolean;
}

export const AuctionsTable = memo(({ 
  auctions, 
  isLoading, 
  error, 
  ...paginationProps 
}: AuctionsTableProps & PaginationProps) => {
  const { format } = useNumberFormat();

  const sortedAuctions = useMemo(() => {
    return [...auctions]
      .sort((a, b) => b.time - a.time);
  }, [auctions]);

  const columns = useMemo(() => [
    {
      header: "Name",
      accessor: "name",
      align: "left",
      className: "w-1/3 px-4"
    },
    {
      header: "Deployer",
      accessor: (item: AuctionsTableProps["auctions"][0]) => (
        <Link 
          href={`/explorer/address/${item.deployer}`}
          className="text-[#83E9FF] hover:text-white transition-colors"
        >
          {truncateAddress(item.deployer)}
        </Link>
      ),
      align: "left",
      className: "w-1/3 px-4"
    },
    {
      header: "Price",
      accessor: (item: any) => {
        const amount = parseFloat(item.deployGasAbs);
        return (
          <span>{amount.toFixed(2)} {item.currency}</span>
        );
      },
      align: "left",
      className: "w-1/3 px-4 text-left"
    },
  ] as Column<typeof auctions[0]>[], [format]);

  return (
    <DataTable
      data={sortedAuctions}
      columns={columns}
      isLoading={isLoading}
      error={error}
      {...paginationProps}
    />
  );
});

export const ValidatorsTable = memo(({ 
  validators, 
  isLoading, 
  error, 
  ...paginationProps 
}: ValidatorsTableProps & PaginationProps) => {
  const { format } = useNumberFormat();

  const columns = useMemo(() => [
    {
      header: "Name",
      accessor: "name",
      align: "left",
      className: "px-4"
    },
    {
      header: "APR",
      accessor: (item: ValidatorsTableProps["validators"][0]) => (
        <PriceChange value={item.apr} suffix="%" />
      ),
      align: "left",
      className: "px-4 text-left"
    },
    {
      header: "Stake",
      accessor: (item: ValidatorsTableProps["validators"][0]) => formatStakeValue(item.stake, format),
      align: "left",
      className: "px-4 text-left"
    },
  ] as Column<ValidatorsTableProps["validators"][0]>[], [format]);

  return (
    <DataTable
      data={validators}
      columns={columns}
      isLoading={isLoading}
      error={error}
      {...paginationProps}
    />
  );
});

export const VaultTable = memo(({ 
  vaults, 
  isLoading, 
  error, 
  ...paginationProps 
}: VaultTableProps & PaginationProps) => {
  const { format } = useNumberFormat();

  const columns = useMemo(() => [
    {
      header: "Name",
      accessor: "name",
      align: "left",
      className: "px-4"
    },
    {
      header: "APR",
      accessor: (item: VaultTableProps["vaults"][0]) => (
        <PriceChange value={item.apr} suffix="%" />
      ),
      align: "left",
      className: "px-4 text-left"
    },
    {
      header: "TVL",
      accessor: (item: VaultTableProps["vaults"][0]) => formatTVLValue(item.tvl, format),
      align: "left",
      className: "px-4 text-left"
    },
  ] as Column<VaultTableProps["vaults"][0]>[], [format]);

  return (
    <DataTable
      data={vaults}
      columns={columns}
      isLoading={isLoading}
      error={error}
      {...paginationProps}
    />
  );
}); 