import { formatDate, truncateAddress, formatGasValue, formatStakeValue, formatTVLValue, formatAPRValue } from "@/lib/formatting";
import { AuctionsTableProps, ValidatorsTableProps, VaultTableProps } from "@/components/types/dashboard.types";
import { DataTable, Column } from "./DataTable";
import { useNumberFormat } from "@/store/number-format.store";
import Link from "next/link";
import { PriceChange } from "@/components/ui/PriceChange";

export function AuctionsTable({ auctions, isLoading, error }: AuctionsTableProps) {
  const { format } = useNumberFormat();

  const columns: Column<AuctionsTableProps["auctions"][0]>[] = [
    {
      header: "Name",
      accessor: "name",
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
      align: "right",
    },
    {
      header: "Gas",
      accessor: (item: AuctionsTableProps["auctions"][0]) => formatGasValue(item.deployGas, format),
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
  const { format } = useNumberFormat();

  const columns: Column<ValidatorsTableProps["validators"][0]>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "APR",
      accessor: (item: ValidatorsTableProps["validators"][0]) => (
        <PriceChange value={item.apr} suffix="%" />
      ),
      align: "right",
    },
    {
      header: "Stake",
      accessor: (item: ValidatorsTableProps["validators"][0]) => formatStakeValue(item.stake, format),
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
  const { format } = useNumberFormat();

  const columns: Column<VaultTableProps["vaults"][0]>[] = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "APR",
      accessor: (item: VaultTableProps["vaults"][0]) => (
        <PriceChange value={item.apr} suffix="%" />
      ),
      align: "right",
    },
    {
      header: "TVL",
      accessor: (item: VaultTableProps["vaults"][0]) => formatTVLValue(item.tvl, format),
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