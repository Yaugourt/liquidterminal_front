import { ReactNode } from "react";
import { Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { Pagination, PaginationProps } from "./pagination";
import { ScrollableTable } from "./ScrollableTable";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    TableHeadLabel,
} from "@/components/ui/table";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Column definition for typed DataTable
 */
export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => ReactNode);
    align?: "left" | "right" | "center";
    headerAlign?: "left" | "right" | "center";
    className?: string;
}

/**
 * Base props for wrapper-style DataTable (children-based)
 */
interface DataTableWrapperProps {
    isLoading?: boolean;
    error?: Error | null;
    isEmpty?: boolean;
    emptyState?: {
        title?: string;
        description?: string;
        icon?: ReactNode;
        action?: ReactNode;
    };
    children: ReactNode;
    className?: string;
    loadingMessage?: string;
    errorMessage?: string;
    pagination?: PaginationProps;
}

/**
 * Props for typed DataTable with columns
 */
interface DataTableWithColumnsProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    error?: Error | null;
    emptyMessage?: string;
    className?: string;
    textSize?: "xs" | "sm";
    // Pagination
    total?: number;
    page?: number;
    rowsPerPage?: number;
    onPageChange?: (newPage: number) => void;
    onRowsPerPageChange?: (newRowsPerPage: number) => void;
    showPagination?: boolean;
    paginationDisabled?: boolean;
    hidePageNavigation?: boolean;
}



/**
 * DataTable Wrapper - for custom table implementations (children-based)
 * Use this when you want to provide your own table structure
 */
export function DataTable({
    isLoading,
    error,
    isEmpty,
    emptyState,
    children,
    className,
    loadingMessage = "Loading...",
    errorMessage = "An error occurred",
    pagination,
}: DataTableWrapperProps) {
    if (isLoading) {
        return <LoadingState message={loadingMessage} size="lg" />;
    }

    if (error) {
        return <ErrorState title={errorMessage} message={error.message} />;
    }

    if (isEmpty) {
        return (
            <EmptyState
                title={emptyState?.title}
                description={emptyState?.description}
                icon={emptyState?.icon}
                action={emptyState?.action}
            />
        );
    }

    return (
        <div>
            <div className={cn("overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent rounded-lg", className)}>
                {children}
            </div>

            {pagination && (
                <div className="px-4 py-3 border-t border-border-subtle">
                    <Pagination {...pagination} />
                </div>
            )}
        </div>
    );
}

/**
 * TypedDataTable - for data-driven tables with column definitions
 * Use this when you have structured data and column definitions
 */
export function TypedDataTable<T>({
    data,
    columns,
    isLoading,
    error,
    emptyMessage = "No data available",
    className,
    textSize = "sm",
    total = 0,
    page = 0,
    rowsPerPage = 5,
    onPageChange,
    onRowsPerPageChange,
    showPagination = false,
    paginationDisabled = false,
    hidePageNavigation = false,
}: DataTableWithColumnsProps<T>) {
    if (isLoading) {
        return <LoadingState message="Chargement..." size="md" withCard={false} />;
    }

    if (error) {
        return (
            <ErrorState
                title="Une erreur est survenue"
                message="Veuillez réessayer plus tard"
                withCard={false}
            />
        );
    }

    return (
        <div className={cn("w-full h-full flex flex-col", className)}>
            <ScrollableTable
                    pagination={showPagination && total > 0 && onPageChange && onRowsPerPageChange ? {
                        total,
                        page,
                        rowsPerPage,
                        onPageChange,
                        onRowsPerPageChange,
                        rowsPerPageOptions: [5, 10, 15, 20],
                        disabled: paginationDisabled,
                        hidePageNavigation,
                    } : undefined}
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border-subtle hover:bg-transparent">
                                {columns.map((column, index) => (
                                    <TableHead
                                        key={index}
                                        className={cn(
                                            textSize === "xs" ? "py-2" : "py-3",
                                            "px-4",
                                            column.className
                                        )}
                                    >
                                        <TableHeadLabel align={column.align}>{column.header}</TableHeadLabel>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? (
                                data.map((item, rowIndex) => (
                                    <TableRow
                                        key={rowIndex}
                                        className="border-b border-border-subtle hover:bg-white/[0.02] transition-colors"
                                    >
                                        {columns.map((column, colIndex) => (
                                            <TableCell
                                                key={colIndex}
                                                className={cn(
                                                    textSize === "xs" ? "py-2" : "py-3",
                                                    "px-4",
                                                    column.className,
                                                    `text-${textSize} text-white font-medium`
                                                )}
                                            >
                                                {typeof column.accessor === "function"
                                                    ? column.accessor(item)
                                                    : String(item[column.accessor])}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="py-8 border-none">
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <Database className="w-10 h-10 mb-3 text-text-muted" />
                                            <p className="text-text-secondary text-sm mb-1">{emptyMessage}</p>
                                            <p className="text-text-muted text-xs">Come later</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollableTable>
        </div>
    );
}
