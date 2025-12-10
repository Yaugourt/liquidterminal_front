import React, { useState } from "react";
import { useNumberFormat } from '@/store/number-format.store';
import { TransactionListProps } from "@/components/types/explorer.types";
import { useSpotTokens } from '@/services/market/spot/hooks/useSpotMarket';
import { usePerpMarkets } from '@/services/market/perp/hooks/usePerpMarket';
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { DataTable } from "@/components/common/DataTable";
import { TransactionRow } from "./TransactionRow";

export function TransactionList({ transactions, isLoading, error, currentAddress }: TransactionListProps) {
  const { format } = useNumberFormat();

  // Récupération des données de marché pour les prix
  const { data: spotTokens } = useSpotTokens({ limit: 100 });
  const { data: perpMarkets } = usePerpMarkets({ limit: 1000 });

  // Configuration pour les formatters
  const formatterConfig = {
    spotTokens,
    perpMarkets,
    format,
    currentAddress
  };

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Pagination logic
  const total = transactions?.length || 0;
  const paginatedTxs = transactions?.slice(page * rowsPerPage, (page + 1) * rowsPerPage) || [];

  return (
    <DataTable
      isLoading={isLoading}
      error={error}
      isEmpty={!transactions || transactions.length === 0}
      loadingMessage="Loading transactions..."
      errorMessage="Failed to load transactions"
      emptyState={{ title: "No transactions found" }}
      className="max-h-[600px]"
      pagination={{
        total: total,
        page: page,
        rowsPerPage: rowsPerPage,
        onPageChange: setPage,
        onRowsPerPageChange: (newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(0);
        },
        disabled: isLoading
      }}
    >
      <Table className="w-full">
        <TableHeader>
          <TableRow className="border-none bg-brand-tertiary">
            <TableHead className="text-white font-normal py-3 px-4 bg-brand-tertiary text-left text-sm">Hash</TableHead>
            <TableHead className="text-white font-normal py-3 px-4 bg-brand-tertiary text-left text-sm">Method</TableHead>
            <TableHead className="text-white font-normal py-3 px-4 bg-brand-tertiary text-left text-sm">Age</TableHead>
            <TableHead className="text-white font-normal py-3 px-4 bg-brand-tertiary text-left text-sm">From</TableHead>
            <TableHead className="text-white font-normal py-3 px-4 bg-brand-tertiary text-left text-sm">To</TableHead>
            <TableHead className="text-white font-normal py-3 px-4 bg-brand-tertiary text-left text-sm">Token</TableHead>
            <TableHead className="text-white font-normal py-3 px-4 bg-brand-tertiary text-left text-sm">Price</TableHead>
            <TableHead className="text-white font-normal py-3 px-4 bg-brand-tertiary text-right text-sm">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="bg-brand-tertiary">
          {paginatedTxs.map((tx) => (
            <TransactionRow
              key={tx.hash}
              tx={tx}
              formatterConfig={formatterConfig}
              currentAddress={currentAddress}
            />
          ))}
        </TableBody>
      </Table>
    </DataTable>
  );
} 