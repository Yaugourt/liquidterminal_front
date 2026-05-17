import React, { useState } from "react";
import { useNumberFormat } from '@/store/number-format.store';
import { TransactionListProps } from "@/components/types/explorer.types";
import { useSpotTokens } from '@/services/market/spot/hooks/useSpotMarket';
import { usePerpMarkets } from '@/services/market/perp/hooks/usePerpMarket';
import { Table, TableHeader, TableBody, TableRow, TableHead } from "@/components/ui/table";
import { DataTable } from "@/components/common";
import { TransactionRow } from "./TransactionRow";

export function AddressTransactionList({ transactions, isLoading, error, currentAddress }: TransactionListProps) {
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
      className="max-h-[600px] bg-brand-secondary/60 border border-border-subtle rounded-2xl"
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
          <TableRow className="border-b border-border-subtle hover:bg-transparent">
            <TableHead className="py-3 px-4 text-left">Hash</TableHead>
            <TableHead className="py-3 px-4 text-left">Method</TableHead>
            <TableHead className="py-3 px-4 text-left">Age</TableHead>
            <TableHead className="py-3 px-4 text-left">From</TableHead>
            <TableHead className="py-3 px-4 text-left">To</TableHead>
            <TableHead className="py-3 px-4 text-left">Token</TableHead>
            <TableHead className="py-3 px-4 text-left">Price</TableHead>
            <TableHead className="py-3 px-4 text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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