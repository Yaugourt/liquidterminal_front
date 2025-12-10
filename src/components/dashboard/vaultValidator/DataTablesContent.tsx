import { memo, useMemo } from "react";
import { formatStakeValue, formatTVLValue } from "@/lib/formatters/numberFormatting";
import { AuctionsTableProps, ValidatorsTableProps, VaultTableProps } from "@/components/types/dashboard.types";
import { DataTable, Column } from "./DataTable";
import { useNumberFormat } from "@/store/number-format.store";
import { PriceChange } from '@/components/common';
import { AddressDisplay } from "@/components/ui/address-display";

// Extended validator type for the component
interface ExtendedValidator {
  name: string;
  apr: number;
  stake: number;
  validator?: string;
  address?: string;
}

interface PaginationProps {
  total?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  showPagination?: boolean;
}

const AuctionsTableComponent = ({
  auctions,
  isLoading,
  error,
  paginationDisabled = false,
  hidePageNavigation = false,
  ...paginationProps
}: AuctionsTableProps & PaginationProps & { paginationDisabled?: boolean; hidePageNavigation?: boolean }) => {


  const sortedAuctions = useMemo(() => {
    return [...auctions]
      .sort((a, b) => b.time - a.time);
  }, [auctions]);

  const columns = useMemo(() => [
    {
      header: "Name",
      accessor: "name",
      align: "left",
      className: "w-[120px] px-4"
    },
    {
      header: "Deployer",
      accessor: (item: AuctionsTableProps["auctions"][0]) => (
        <AddressDisplay address={item.deployer} />
      ),
      align: "left",
      className: "w-[140px] px-4"
    },
    {
      header: "Price",
      accessor: (item: AuctionsTableProps["auctions"][0]) => {
        const amount = parseFloat(item.deployGasAbs);
        return (
          <span>{amount.toFixed(2)} {item.currency}</span>
        );
      },
      align: "left",
      className: "w-[180px] px-4 text-left"
    },
  ] as Column<typeof auctions[0]>[], []);

  return (
    <DataTable
      data={sortedAuctions}
      columns={columns}
      isLoading={isLoading}
      error={error}
      paginationDisabled={paginationDisabled ?? false}
      hidePageNavigation={hidePageNavigation ?? false}
      {...paginationProps}
    />
  );
};

export const AuctionsTable = memo(AuctionsTableComponent);
AuctionsTable.displayName = 'AuctionsTable';

const ValidatorsTableComponent = ({
  validators,
  isLoading,
  error,
  paginationDisabled = false,
  hidePageNavigation = false,
  ...paginationProps
}: ValidatorsTableProps & PaginationProps & { paginationDisabled?: boolean; hidePageNavigation?: boolean }) => {
  const { format } = useNumberFormat();


  const columns = useMemo(() => [
    {
      header: "Name",
      accessor: (item: ExtendedValidator) => {
        const address = item.validator || item.address || item.name;
        return (
          <AddressDisplay address={address} truncate={false} className="text-white hover:text-brand-accent" />
        );
      },
      align: "left",
      className: "w-[220px] px-4"
    },
    {
      header: "APR",
      accessor: (item: ValidatorsTableProps["validators"][0]) => (
        <PriceChange value={item.apr} suffix="%" />
      ),
      align: "center",
      className: "w-[120px] px-2 text-center"
    },
    {
      header: "Stake",
      accessor: (item: ValidatorsTableProps["validators"][0]) => formatStakeValue(item.stake, format),
      align: "right",
      className: "w-[120px] px-4 pr-6 text-right"
    },
  ] as Column<ExtendedValidator>[], [format]);

  return (
    <DataTable
      data={validators}
      columns={columns}
      isLoading={isLoading}
      error={error}
      paginationDisabled={paginationDisabled ?? false}
      hidePageNavigation={hidePageNavigation ?? false}
      {...paginationProps}
    />
  );
};

export const ValidatorsTable = memo(ValidatorsTableComponent);
ValidatorsTable.displayName = 'ValidatorsTable';

const VaultTableComponent = ({
  vaults,
  isLoading,
  error,
  paginationDisabled = false,
  hidePageNavigation = false,
  ...paginationProps
}: VaultTableProps & PaginationProps & { paginationDisabled?: boolean; hidePageNavigation?: boolean }) => {
  const { format } = useNumberFormat();


  const columns = useMemo(() => [
    {
      header: "Name",
      accessor: (item: VaultTableProps["vaults"][0]) => (
        <AddressDisplay address={item.vaultAddress || ""} truncate={true} />
      ),
      align: "left",
      className: "w-[220px] px-4"
    },
    {
      header: "APR",
      accessor: (item: VaultTableProps["vaults"][0]) => (
        <PriceChange value={item.apr} suffix="%" />
      ),
      align: "center",
      className: "w-[100px] px-4 text-center"
    },
    {
      header: "TVL",
      accessor: (item: VaultTableProps["vaults"][0]) => formatTVLValue(item.tvl, format),
      align: "left",
      className: "w-[100px] px-4 text-right"
    },
  ] as Column<VaultTableProps["vaults"][0]>[], [format]);

  return (
    <DataTable
      data={vaults}
      columns={columns}
      isLoading={isLoading ?? false}
      error={error}
      paginationDisabled={paginationDisabled ?? false}
      hidePageNavigation={hidePageNavigation ?? false}
      {...paginationProps}
    />
  );
};

export const VaultTable = memo(VaultTableComponent);
VaultTable.displayName = 'VaultTable';