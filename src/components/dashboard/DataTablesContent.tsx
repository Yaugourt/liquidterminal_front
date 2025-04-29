import { formatDate, truncateAddress, formatNumberWithoutDecimals } from "@/lib/formatting";
import { AuctionsTableProps, ValidatorsTableProps, VaultTableProps } from "@/components/types/dashboard.types";
import { DataTable, Column } from "./DataTable";

export function AuctionsTable({ auctions, isLoading, error }: AuctionsTableProps) {
  const columns: Column<AuctionsTableProps["auctions"][0]>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Deployer",
      accessor: (item: AuctionsTableProps["auctions"][0]) => truncateAddress(item.deployer),
    },
    {
      header: "Date",
      accessor: (item: AuctionsTableProps["auctions"][0]) => formatDate(item.time),
      align: "right",
    },
  ];

  return (
    <DataTable
      data={auctions}
      columns={columns}
      isLoading={isLoading}
      error={error}
    />
  );
}

export function ValidatorsTable({ validators, isLoading, error }: ValidatorsTableProps) {
  const columns: Column<ValidatorsTableProps["validators"][0]>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "APR",
      accessor: (item: ValidatorsTableProps["validators"][0]) => `${item.apr.toFixed(2)}%`,
      align: "right",
    },
    {
      header: "Stake",
      accessor: (item: ValidatorsTableProps["validators"][0]) => formatNumberWithoutDecimals(item.stake),
      align: "right",
    },
  ];

  return (
    <DataTable
      data={validators}
      columns={columns}
      isLoading={isLoading}
      error={error}
    />
  );
}

export function VaultTable({ vaults, isLoading, error }: VaultTableProps) {
  const columns: Column<VaultTableProps["vaults"][0]>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "APR",
      accessor: (item: VaultTableProps["vaults"][0]) => `${item.apr.toFixed(2)}%`,
      align: "right",
    },
    {
      header: "TVL",
      accessor: (item: VaultTableProps["vaults"][0]) => `$${formatNumberWithoutDecimals(item.tvl)}`,
      align: "right",
    },
  ];

  return (
    <DataTable
      data={vaults}
      columns={columns}
      isLoading={isLoading}
      error={error}
    />
  );
} 