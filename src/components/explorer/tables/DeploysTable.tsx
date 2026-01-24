"use client";

import { useDeploys } from "@/services/explorer";
import { useDateFormat } from "@/store/date-format.store";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePagination } from "@/hooks/core/usePagination";
import { AddressDisplay } from "@/components/ui/address-display";
import { DataTable } from "@/components/common/DataTable";

export function DeploysTable() {
    const deploysPagination = usePagination({ initialRowsPerPage: 5 });
    const { format: dateFormat } = useDateFormat();
    const { deploys, isLoading, error } = useDeploys();

    const allDeploys = deploys || [];
    const paginatedDeploys = allDeploys.slice(deploysPagination.startIndex, deploysPagination.endIndex);

    return (
        <DataTable
            isLoading={isLoading}
            error={error}
            isEmpty={allDeploys.length === 0}
            loadingMessage="Loading deploys..."
            errorMessage="Failed to load deploys"
            emptyState={{ title: "No deploys available", description: "Come back later" }}
            pagination={{
                total: allDeploys.length,
                page: deploysPagination.page,
                rowsPerPage: deploysPagination.rowsPerPage,
                rowsPerPageOptions: [5, 10, 25, 50],
                onPageChange: deploysPagination.onPageChange,
                onRowsPerPageChange: deploysPagination.onRowsPerPageChange,
                disabled: isLoading
            }}
        >
            <Table className="w-full">
                <TableHeader>
                    <TableRow className="border-b border-border-subtle hover:bg-transparent">
                        <TableHead className="py-3 px-3">
                            <span className="text-text-secondary font-semibold uppercase tracking-wider">Time</span>
                        </TableHead>
                        <TableHead className="py-3 px-3">
                            <span className="text-text-secondary font-semibold uppercase tracking-wider">User</span>
                        </TableHead>
                        <TableHead className="py-3 px-3">
                            <span className="text-text-secondary font-semibold uppercase tracking-wider">Action</span>
                        </TableHead>
                        <TableHead className="py-3 px-3">
                            <span className="text-text-secondary font-semibold uppercase tracking-wider">Hash</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedDeploys.map((deploy) => (
                        <TableRow key={deploy.hash} className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors">
                            <TableCell className="py-3 px-3 text-white font-medium">
                                {formatDateTime(deploy.timestamp, dateFormat)}
                            </TableCell>
                            <TableCell className="py-3 px-3 text-sm">
                                <AddressDisplay address={deploy.user} />
                            </TableCell>
                            <TableCell className="py-3 px-3">
                                <StatusBadge variant={deploy.status === 'error' ? 'error' : 'success'}>
                                    {deploy.action}
                                </StatusBadge>
                            </TableCell>
                            <TableCell className="py-3 px-3 text-brand-accent">
                                <AddressDisplay address={deploy.hash} showCopy={false} showExternalLink={true} className="text-brand-accent" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </DataTable>
    );
}
