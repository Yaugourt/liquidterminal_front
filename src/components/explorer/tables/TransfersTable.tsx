"use client";

import { useTransfers } from "@/services/explorer";
import { useNumberFormat } from "@/store/number-format.store";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { formatDistanceToNowStrict } from "date-fns";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { usePagination } from "@/hooks/core/usePagination";
import { AddressDisplay } from "@/components/ui/address-display";
import { DataTable } from "@/components/common/DataTable";

export function TransfersTable() {
    const transfersPagination = usePagination({ initialRowsPerPage: 5 });
    const { format } = useNumberFormat();
    const { transfers, isLoading, error } = useTransfers();

    const allTransfers = transfers || [];
    const paginatedTransfers = allTransfers.slice(transfersPagination.startIndex, transfersPagination.endIndex);

    return (
        <DataTable
            isLoading={isLoading}
            error={error}
            isEmpty={allTransfers.length === 0}
            loadingMessage="Loading transfers..."
            errorMessage="Failed to load transfers"
            emptyState={{ title: "No transfers available", description: "Come back later" }}
            pagination={{
                total: allTransfers.length,
                page: transfersPagination.page,
                rowsPerPage: transfersPagination.rowsPerPage,
                rowsPerPageOptions: [5, 10, 25, 50],
                onPageChange: transfersPagination.onPageChange,
                onRowsPerPageChange: transfersPagination.onRowsPerPageChange,
                disabled: isLoading
            }}
        >
            <Table className="w-full">
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>
                            <span className="text-text-secondary font-semibold uppercase tracking-wider">Time</span>
                        </TableHead>
                        <TableHead>
                            <span className="text-text-secondary font-semibold uppercase tracking-wider">Amount</span>
                        </TableHead>
                        <TableHead>
                            <span className="text-text-secondary font-semibold uppercase tracking-wider">From</span>
                        </TableHead>
                        <TableHead>
                            <span className="text-text-secondary font-semibold uppercase tracking-wider">To</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedTransfers.map((transfer) => (
                        <TableRow key={transfer.hash} className="hover:bg-white/[0.02]">
                            <TableCell className="text-white font-medium">
                                {formatDistanceToNowStrict(transfer.timestamp, { addSuffix: false })}
                            </TableCell>
                            <TableCell className="text-white font-medium">
                                {(() => {
                                    const numericAmount = typeof transfer.amount === 'string' ? parseFloat(transfer.amount) : transfer.amount;
                                    return `${formatNumber(numericAmount, format, {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 2
                                    })} ${transfer.token}`;
                                })()}
                            </TableCell>
                            <TableCell className="text-sm">
                                <AddressDisplay address={transfer.from} />
                            </TableCell>
                            <TableCell>
                                <AddressDisplay address={transfer.to} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </DataTable>
    );
}
