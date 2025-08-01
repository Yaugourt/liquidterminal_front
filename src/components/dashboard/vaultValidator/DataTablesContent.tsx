import { memo, useMemo, useState, useCallback } from "react";
import {truncateAddress, formatStakeValue, formatTVLValue} from "@/lib/numberFormatting";
import { AuctionsTableProps, ValidatorsTableProps, VaultTableProps } from "@/components/types/dashboard.types";
import { DataTable, Column } from "./DataTable";
import { useNumberFormat } from "@/store/number-format.store";
import Link from "next/link";
import { PriceChange } from '@/components/common';
import { Copy, Check } from "lucide-react";

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
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      // Error handled silently
    }
  }, []);

  const AddressLink = memo(({ address }: { address: string }) => (
    <div className="  flex items-center gap-1.5">
      <Link 
        href={`/explorer/address/${address}`}
        className="text-[#83E9FF] hover:text-white transition-colors"
      >
        {truncateAddress(address)}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          copyToClipboard(address);
        }}  
        className="group p-1 rounded transition-colors"
      >
        {copiedAddress === address ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100" />
        )}
      </button>
    </div>
  ));
  AddressLink.displayName = 'AddressLink';

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
        <AddressLink address={item.deployer} />
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
  ] as Column<typeof auctions[0]>[], [AddressLink]);

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
  const [copiedValidatorAddress, setCopiedValidatorAddress] = useState<string | null>(null);

  const copyValidatorToClipboard = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedValidatorAddress(address);
      setTimeout(() => setCopiedValidatorAddress(null), 2000);
    } catch {
      // Error handled silently
    }
  }, []);

  const ValidatorNameWithCopy = memo(({ validator }: { validator: ExtendedValidator }) => {
    const address = validator.validator || validator.address || validator.name;
    return (
      <div className="flex items-center gap-1.5">
        <Link 
          href={`/explorer/address/${address}`}
          className="text-white font-inter hover:text-[#83E9FF] transition-colors"
        >
          {validator.name}
        </Link>
        <button
          onClick={(e) => {
            e.preventDefault();
            copyValidatorToClipboard(address);
          }}
          className="group p-1 rounded transition-colors"
        >
          {copiedValidatorAddress === address ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100" />
          )}
        </button>
      </div>
    );
  });
  ValidatorNameWithCopy.displayName = 'ValidatorNameWithCopy';

  const columns = useMemo(() => [
    {
      header: "Name",
      accessor: (item: ExtendedValidator) => (
        <ValidatorNameWithCopy validator={item} />
      ),
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
  ] as Column<ExtendedValidator>[], [format, ValidatorNameWithCopy]);

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
  const [copiedVaultAddress, setCopiedVaultAddress] = useState<string | null>(null);

  const copyVaultToClipboard = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedVaultAddress(address);
      setTimeout(() => setCopiedVaultAddress(null), 2000);
    } catch {
      // Error handled silently
    }
  }, []);

  const columns = useMemo(() => [
    {
      header: "Name",
      accessor: (item: VaultTableProps["vaults"][0]) => (
        <div className="flex items-center gap-1.5">
          <Link 
            href={`/explorer/address/${item.vaultAddress}`}
            className="text-white font-inter hover:text-[#83E9FF] transition-colors"
          >
            {item.name.length > 18 ? `${item.name.substring(0, 18)}...` : item.name}
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              copyVaultToClipboard(item.vaultAddress || "");
            }}
            className="group p-1 rounded transition-colors"
          >
            {String(copiedVaultAddress ?? "") === String(item.vaultAddress ?? "") ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-[#f9e370] opacity-60 group-hover:opacity-100" />
            )}
          </button>
        </div>
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
  ] as Column<VaultTableProps["vaults"][0]>[], [format, copiedVaultAddress, copyVaultToClipboard]);

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