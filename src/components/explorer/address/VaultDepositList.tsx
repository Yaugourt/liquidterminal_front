import React, { useState } from "react";
import Link from "next/link";
import { Copy, Check } from "lucide-react";
import { useVaultDeposits } from '@/services/explorer/vault/hooks/useVaultDeposits';
import { useVaults } from '@/services/explorer/vault/hooks/useVaults';
import { useNumberFormat } from '@/store/number-format.store';
import { formatNumber } from '@/lib/formatters/numberFormatting';
import { TypedDataTable, type Column } from '@/components/common';
import { Card } from "@/components/ui/card";
import { InlineSpinner } from "@/components/ui/inline-spinner";

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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const total = rows.length;
  const paginatedRows = rows.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      // Error handled silently
    }
  };

  const formatTimeLock = (timestamp?: number) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const formatEquity = (equity: string) =>
    formatNumber(parseFloat(equity), format, { minimumFractionDigits: 2, maximumFractionDigits: 6 });

  const formatTVL = (tvl: number | null) => {
    if (tvl == null) return '-';
    return formatNumber(tvl, format, { currency: '$', showCurrency: true });
  };

  const formatAPR = (apr: number | null) => {
    if (apr == null) return '-';
    return formatNumber(apr, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
  };

  const columns: Column<VaultDepositRow>[] = [
    {
      key: "name",
      header: "Name",
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          <Link
            href={`/explorer/address/${row.vaultAddress}`}
            className="text-text-primary font-inter hover:text-brand transition-colors"
            title={row.vaultAddress}
          >
            {row.name}
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              copyToClipboard(row.vaultAddress);
            }}
            className="group p-1 rounded transition-colors"
          >
            {copiedAddress === row.vaultAddress ? (
              <Check className="h-3.5 w-3.5 text-success transition-all duration-200" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-gold opacity-60 group-hover:opacity-100 transition-all duration-200" />
            )}
          </button>
        </div>
      ),
    },
    {
      key: "equity",
      header: "User deposits",
      accessor: (row) => <span className="text-text-primary">${formatEquity(row.equity)}</span>,
    },
    {
      key: "apr",
      header: "APR",
      accessor: (row) => <span className="text-success">{formatAPR(row.apr)}</span>,
    },
    {
      key: "tvl",
      header: "TVL",
      accessor: (row) => <span className="text-text-primary">{formatTVL(row.tvl)}</span>,
    },
    {
      key: "lock",
      header: "Time lock",
      accessor: (row) => <span className="text-text-primary">{formatTimeLock(row.lockedUntilTimestamp)}</span>,
    },
  ];

  if (isLoading || vaultsLoading) {
    return (
      <Card className="flex items-center justify-center h-[400px]">
        <InlineSpinner className="h-8 w-8 text-brand" />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden flex flex-col">
      <TypedDataTable<VaultDepositRow>
        data={paginatedRows}
        columns={columns}
        getRowKey={(row) => row.vaultAddress}
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
      />
    </Card>
  );
}
