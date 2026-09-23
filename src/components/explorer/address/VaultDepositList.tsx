import { useState } from "react";
import { useVaultDeposits } from '@/services/explorer/vault/hooks/useVaultDeposits';
import { useVaults } from '@/services/explorer/vault/hooks/useVaults';
import { useNumberFormat } from '@/store/number-format.store';
import { useDateFormat } from '@/store/date-format.store';
import { formatNumber } from '@/lib/formatters/numberFormatting';
import { formatDateTime } from '@/lib/formatters/dateFormatting';
import { getTokenInitials } from '@/lib/tokenIconUrl';
import { TypedDataTable, ModuleAsset, type Column } from '@/components/common';
import { AddressDisplay } from "@/components/ui/address-display";

interface VaultDepositListProps {
  address: string;
}

interface VaultDepositRow {
  vaultAddress: string;
  name: string;
  equity: string;
  apr: number | null;
  tvl: number | null;
  lockedUntilTimestamp?: number;
}

export function VaultDepositList({ address }: VaultDepositListProps) {
  const { enrichedDeposits: rows, isLoading, error } = useVaultDeposits(address);
  const { isLoading: vaultsLoading } = useVaults();
  const { format } = useNumberFormat();
  const { format: dateFormat } = useDateFormat();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const total = rows.length;
  const paginatedRows = rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const usd = (n: number) =>
    formatNumber(n, format, { currency: '$', showCurrency: true, minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const columns: Column<VaultDepositRow>[] = [
    {
      key: "name",
      header: "Vault",
      accessor: (row) => (
        <ModuleAsset
          logo={getTokenInitials(row.name)}
          name={row.name}
          sub={<AddressDisplay address={row.vaultAddress} href={`/explorer/address/${row.vaultAddress}`} />}
        />
      ),
    },
    {
      key: "equity",
      header: "User deposits",
      type: "numeric",
      accessor: (row) => usd(parseFloat(row.equity)),
    },
    {
      key: "apr",
      header: "APR",
      type: "numeric",
      tone: (row) => (row.apr == null ? "muted" : "success"),
      accessor: (row) =>
        row.apr == null
          ? "—"
          : `${formatNumber(row.apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
    },
    {
      key: "tvl",
      header: "TVL",
      type: "numeric",
      accessor: (row) => (row.tvl == null ? "—" : usd(row.tvl)),
    },
    {
      key: "lock",
      header: "Time lock",
      type: "time",
      align: "right",
      accessor: (row) =>
        row.lockedUntilTimestamp ? formatDateTime(row.lockedUntilTimestamp, dateFormat) : "—",
    },
  ];

  return (
    <TypedDataTable<VaultDepositRow>
      data={paginatedRows}
      columns={columns}
      getRowKey={(row) => row.vaultAddress}
      isLoading={isLoading || vaultsLoading}
      error={error}
      errorTitle="Failed to load deposits"
      emptyMessage="No vault deposits found"
      emptyDescription="This address has not deposited in any vault yet."
      total={total}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={setPage}
      onRowsPerPageChange={(n) => { setRowsPerPage(n); setPage(0); }}
      paginationVariant={total > 10 ? "full" : "none"}
      density="compact"
    />
  );
}
