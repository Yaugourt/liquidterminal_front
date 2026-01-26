import { ReactNode } from "react";
import { Loader2, Database, AlertCircle } from "lucide-react";
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
import { Card } from "@/components/ui/card";

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
        return (
            <Card className="flex flex-col items-center justify-center h-[300px] w-full">
                <Loader2 className="h-8 w-8 animate-spin text-brand-accent mb-3" />
                <span className="text-text-muted text-sm">{loadingMessage}</span>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="flex flex-col items-center justify-center h-[300px] w-full text-center px-4">
                <AlertCircle className="w-12 h-12 mb-4 text-rose-500/50" />
                <p className="text-rose-400 text-lg mb-2">{errorMessage}</p>
                <p className="text-text-muted text-sm">{error.message}</p>
            </Card>
        );
    }

    if (isEmpty) {
        return (
            <Card className="flex flex-col items-center justify-center h-[300px] w-full text-center px-4">
                <div className="w-16 h-16 mb-4 bg-white/5 rounded-2xl flex items-center justify-center">
                    {emptyState?.icon || <Database className="w-8 h-8 text-text-muted" />}
                </div>
                <p className="text-white text-lg mb-2">{emptyState?.title || "No data available"}</p>
                <p className="text-text-muted text-sm mb-4">{emptyState?.description || "There is no data to display at this time."}</p>
                {emptyState?.action}
            </Card>
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
    return (
        <div className={cn("w-full h-full flex flex-col", className)}>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[200px]">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-accent mb-2" />
                    <span className="text-text-muted text-sm">Chargement...</span>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-center px-4">
                    <Database className="w-8 h-8 mb-3 text-rose-400" />
                    <p className="text-rose-400 text-sm mb-1">Une erreur est survenue</p>
                    <p className="text-text-muted text-xs">Veuillez réessayer plus tard</p>
                </div>
            ) : (
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
            )}
        </div>
    );
}
