"use client";

import { ReactNode, useCallback, useState } from "react";
import { Database } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Pagination, type PaginationProps } from "./pagination";
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
import { Card } from "@/components/ui/card";
import { SortableTableHead } from "./tables/SortableTableHead";
import { TablePaginationFooter } from "./tables/TablePaginationFooter";
import {
    useSortablePagination,
    type SortDirection,
} from "./tables/useSortablePagination";

// ─── Public types ─────────────────────────────────────────────────────

/**
 * Sémantique d'une colonne — pilote le style V4 automatiquement.
 * - `numeric` : police mono, aligné à droite.
 * - `fees`    : police mono + or (`.fees-cell`), aligné à droite — colonne Builder Fees.
 * - `change`  : police mono, couleur signée (vert/rouge) si la valeur est un nombre.
 * - `address` : police mono, troncature auto (`0x1234…abcd`) si la valeur est une string.
 * - `text` / `custom` (défaut) : aucun style auto — comportement historique.
 */
export type ColumnType = "text" | "numeric" | "fees" | "change" | "address" | "custom";

/**
 * Column definition for `TypedDataTable`. Each column declares a stable
 * `key` (used as React key + sort field), a header label, and an accessor
 * that maps a row to a cell node (or to a row property).
 *
 * Mark `sortable: true` to make the column header clickable; supply
 * `getSortValue` (or rely on the column's numeric/string `accessor`) to
 * extract the value used by the local sort engine.
 */
export interface Column<T> {
    /**
     * Stable identifier — used as React key AND as the sort field name.
     * Optional for backward-compat: falls back to column index when omitted.
     * REQUIRED when `sortable: true` (used by the sort engine).
     */
    key?: string;
    /** Header label (string or any ReactNode). */
    header: ReactNode;
    /**
     * Maps a row to a cell node. Either a property key (`'name'`) or a
     * function `(row, index, absoluteIndex) => ReactNode`:
     * - `index` is the row's position within the current page (0..pageSize-1).
     * - `absoluteIndex` is the row's position within the full sorted dataset
     *   when TypedDataTable owns pagination (local mode); equal to `index`
     *   otherwise. Use it for global "Rank"-style cells.
     * Function accessors are required for computed cells (formatting,
     * badges, multiple values).
     */
    accessor: keyof T | ((item: T, index: number, absoluteIndex: number) => ReactNode);
    /** Cell text alignment. */
    align?: "left" | "right" | "center";
    /** Header alignment (defaults to `align`). */
    headerAlign?: "left" | "right" | "center";
    /** Extra class on the column's header AND cells. */
    className?: string;
    /** Fixed column width (e.g. `'140px'`, `'12%'`). Applied via inline style on `<TableHead>`. */
    width?: string | number;
    /** When true, the header is clickable and toggles the active sort. */
    sortable?: boolean;
    /**
     * Maps a row to a comparable value for sorting. Required when
     * `sortable: true` and the `accessor` is a function. If `accessor` is
     * a `keyof T` and points to a number/string, this is optional.
     */
    getSortValue?: (item: T) => number | string;
    /**
     * Sémantique de la colonne — applique le style V4 (mono, alignement,
     * or des fees, couleur signée) sans rien styler à la main. Défaut `custom`
     * = comportement historique inchangé. Voir `ColumnType`.
     */
    type?: ColumnType;
    /**
     * Formateur optionnel appliqué quand `accessor` est une clé (`keyof T`).
     * Reçoit la valeur brute + la ligne. Ignoré si `accessor` est une fonction
     * (la fonction produit déjà le nœud).
     */
    format?: (value: unknown, row: T) => ReactNode;
}

type Density = "compact" | "comfortable";

interface DensityStyles {
    cellPaddingY: string;
    cellPaddingX: string;
    textSize: string;
}

// V4 table densities (spec §5.3) — dense rows, the V4 signature.
const DENSITY_STYLES: Record<Density, DensityStyles> = {
    comfortable: { cellPaddingY: "py-2", cellPaddingX: "px-3.5", textSize: "text-sm" },
    compact:     { cellPaddingY: "py-1.5", cellPaddingX: "px-3", textSize: "text-xs" },
};

// ─── DataTable wrapper (children-based) ───────────────────────────────

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
 * DataTable Wrapper — for custom table implementations (children-based).
 *
 * Use when you want to provide your own `<Table>` JSX (full markup
 * control) but reuse the standard loading/error/empty states + pagination.
 * For data-driven tables with column configs, prefer `<TypedDataTable>`.
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
            <div className={cn("overflow-x-auto scrollbar-brand rounded-lg", className)}>
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

// ─── TypedDataTable (the canonical primitive) ─────────────────────────

type PaginationVariant = "full" | "compact" | "none";

interface TypedDataTableProps<T> {
    // ── Data ──────────────────────────────────────────────────────────
    /** The full dataset for the current page (server-paginated) OR the entire dataset (local pagination). */
    data: T[];
    /** Column definitions. See `Column<T>`. */
    columns: Column<T>[];
    /** Stable React key per row. Defaults to row index — provide one when rows may reorder (sortable). */
    getRowKey?: (row: T, index: number) => string | number;

    // ── States ────────────────────────────────────────────────────────
    /** Replaces the table body with `<LoadingState>`. */
    isLoading?: boolean;
    /** Replaces the table body with `<ErrorState>`. */
    error?: Error | null;
    /** Retry handler attached to the error state. */
    onErrorRetry?: () => void | Promise<void>;
    /** Title for the error state. Defaults to "Could not load data". */
    errorTitle?: string;
    /** Empty-state row text. */
    emptyMessage?: string;
    /** Empty-state subtitle (below `emptyMessage`). Defaults to "Check back soon". Pass an empty string to hide. */
    emptyDescription?: string;

    // ── Visual ────────────────────────────────────────────────────────
    /**
     * Cell padding + font size preset.
     * - `"comfortable"` (default): `py-3 px-4 text-sm` — full data tables.
     * - `"compact"`:                `py-2 px-3 text-xs` — previews, embedded tables.
     */
    density?: Density;
    /** @deprecated Use `density` instead. `'xs' → 'compact'`, `'sm' → 'comfortable'`. */
    textSize?: "xs" | "sm";
    /** Sticky table header during vertical scroll. */
    stickyHeader?: boolean;
    /** Extra class on the outer wrapper. */
    className?: string;

    // ── Row interactions ──────────────────────────────────────────────
    /** Click handler invoked when a row is clicked. Adds `cursor-pointer`. */
    onRowClick?: (row: T, index: number) => void;
    /** Extra class on each `<TableRow>`. Function form receives the row + page-local index. */
    rowClassName?: string | ((row: T, index: number) => string);

    // ── Card mode (optional) ──────────────────────────────────────────
    /** When set, wraps the table in a `<Card>` with a header (title + icon + subtitle + action slot). */
    title?: ReactNode;
    /** Icon shown in a tinted square next to the title. Only rendered when `title` is set. */
    icon?: ReactNode;
    /** Subtitle line below the title. Only rendered when `title` is set. */
    subtitle?: ReactNode;
    /** Right-aligned slot in the header (e.g. a `<Select>` or `<Button>`). Only rendered when `title` is set. */
    headerAction?: ReactNode;

    // ── Pagination ────────────────────────────────────────────────────
    /**
     * Pagination footer style.
     * - `"full"` (default when paginating): rows-per-page selector + items range + first/last navigation. Server-paginated tables.
     * - `"compact"`: "Page N of M" + windowed number buttons. Previews/leaderboards (local pagination friendly).
     * - `"none"`: no footer.
     *
     * If unspecified, defaults to `"full"` whenever `showPagination` is true or `paginate` is true.
     */
    paginationVariant?: PaginationVariant;
    /**
     * Enable local pagination (slicing `data` client-side). When true:
     * - You don't need to pass `total`/`page`/`onPageChange` (managed internally).
     * - Combine with `sortable` columns for full local sort + pagination.
     */
    paginate?: boolean;
    /** Initial sort. Only relevant when at least one column is `sortable`. */
    initialSort?: { field: string | null; direction: SortDirection };
    /** Items per page (local mode) or rows-per-page default (controlled mode). */
    itemsPerPage?: number;
    /** Rows-per-page selector options for the `"full"` footer. Defaults to `[5, 10, 15, 20]`. */
    rowsPerPageOptions?: number[];
    // — Controlled mode (server-side pagination) —
    /** Total row count (controlled mode). When supplied, the parent owns paging state. */
    total?: number;
    /** Current page (0-indexed) for controlled mode. */
    page?: number;
    /** Rows per page (controlled mode). */
    rowsPerPage?: number;
    /** Controlled page change handler. */
    onPageChange?: (newPage: number) => void;
    /** Controlled rows-per-page change handler. */
    onRowsPerPageChange?: (newRowsPerPage: number) => void;
    /** @deprecated Use `paginationVariant` (`'none'` disables, anything else enables). */
    showPagination?: boolean;
    /** Greys out the pagination footer while a request is in flight. */
    paginationDisabled?: boolean;
    /** Hides the first/prev/next/last navigation in the `"full"` footer. */
    hidePageNavigation?: boolean;

    // ── Controlled sort (server-side) ─────────────────────────────────
    /**
     * Active le tri contrôlé : quand `onSortChange` est fourni, la table ne
     * trie PAS localement — elle reflète `sortField`/`sortDirection` et émet
     * l'événement, le parent re-fetch. Pour les tables à tri côté API.
     */
    onSortChange?: (field: string, direction: SortDirection) => void;
    /** Colonne triée active (mode contrôlé). */
    sortField?: string | null;
    /** Direction de tri active (mode contrôlé). */
    sortDirection?: SortDirection;

    // ── Slots & animation ─────────────────────────────────────────────
    /** Contenu rendu au-dessus de la table (recherche, filtres). L'état reste géré par le parent. */
    toolbar?: ReactNode;
    /** Anime l'apparition des lignes (`motion.tr`, stagger léger). */
    rowMotion?: boolean;
}

/**
 * TypedDataTable — the canonical primitive for data-driven tables.
 *
 * **Modes:**
 * - **Static**: just `data` + `columns` (no sort, no pagination). Drop-in replacement for `<Table>` boilerplate.
 * - **Sortable**: mark one or more `Column<T>` with `sortable: true`. Tri-state sort
 *   (desc → asc → unsorted) is managed internally via `useSortablePagination`.
 * - **Locally paginated**: set `paginate: true`. Combine with sortable columns for
 *   "Top X" leaderboards. Renders the compact footer by default; switch via `paginationVariant`.
 * - **Server-paginated**: pass `total`, `page`, `rowsPerPage`, `onPageChange`,
 *   `onRowsPerPageChange`. Renders the full footer (with rows-per-page selector
 *   and items range) by default.
 * - **Card mode**: pass `title` (and optionally `icon`/`subtitle`/`headerAction`)
 *   to wrap the table in a styled card with a header.
 */
export function TypedDataTable<T>({
    // Data
    data,
    columns,
    getRowKey,
    // States
    isLoading,
    error,
    onErrorRetry,
    errorTitle = "Could not load data",
    emptyMessage = "No data available",
    emptyDescription = "Check back soon",
    // Visual
    density,
    textSize,
    stickyHeader = false,
    className,
    // Row
    onRowClick,
    rowClassName,
    // Card mode
    title,
    icon,
    subtitle,
    headerAction,
    // Pagination
    paginationVariant,
    paginate = false,
    initialSort,
    itemsPerPage,
    rowsPerPageOptions,
    total,
    page,
    rowsPerPage,
    onPageChange,
    onRowsPerPageChange,
    showPagination,
    paginationDisabled = false,
    hidePageNavigation = false,
    onSortChange,
    sortField,
    sortDirection,
    toolbar,
    rowMotion = false,
}: TypedDataTableProps<T>) {
    // ── Resolve density (backward-compat with textSize) ──────────────
    const resolvedDensity: Density = density
        ?? (textSize === "xs" ? "compact" : "comfortable");
    const ds = DENSITY_STYLES[resolvedDensity];

    // ── Identify the sort state owner ─────────────────────────────────
    const hasSortableColumn = columns.some((c) => c.sortable);
    const hasLocalPagination = paginate;
    // Controlled sort: the parent owns sort state and re-fetches on change.
    const isControlledSort = onSortChange !== undefined;
    // Local sort engine runs only when sorting is NOT controlled.
    const useLocalSort = hasSortableColumn && !isControlledSort;

    // Controlled-sort click handler — toggles desc/asc, defaults desc on a new field.
    const handleControlledSort = useCallback(
        (field: string) => {
            const nextDir: SortDirection =
                field === sortField && sortDirection === "desc" ? "asc" : "desc";
            onSortChange?.(field, nextDir);
        },
        [sortField, sortDirection, onSortChange]
    );

    // Internal rows-per-page state for local mode + "full" variant.
    const [localRowsPerPage, setLocalRowsPerPage] = useState<number>(
        itemsPerPage ?? rowsPerPage ?? 10
    );

    // Local sort+pagination engine (used when `paginate` or any sortable column).
    const local = useSortablePagination<T, string>({
        data: useLocalSort || hasLocalPagination ? data : EMPTY,
        itemsPerPage: hasLocalPagination
            ? localRowsPerPage
            : (itemsPerPage ?? rowsPerPage ?? 10),
        getSortValue: (row, field) => {
            const col = columns.find((c, i) => (c.key ?? `col-${i}`) === field);
            if (!col) return "";
            if (col.getSortValue) return col.getSortValue(row);
            if (typeof col.accessor === "string" || typeof col.accessor === "number" || typeof col.accessor === "symbol") {
                const v = row[col.accessor as keyof T];
                return typeof v === "number" ? v : String(v ?? "");
            }
            // Function accessor without explicit getSortValue: fall back to its rendered text.
            const rendered = (col.accessor as (item: T, index: number) => ReactNode)(row, 0);
            return typeof rendered === "string" || typeof rendered === "number" ? rendered : "";
        },
        initialSort: initialSort
            ? { field: initialSort.field as string, direction: initialSort.direction }
            : undefined,
    });

    // ── Resolve pagination variant ────────────────────────────────────
    const isControlledPag =
        total !== undefined &&
        page !== undefined &&
        rowsPerPage !== undefined &&
        onPageChange !== undefined &&
        onRowsPerPageChange !== undefined;

    const paginationEnabled =
        paginationVariant !== "none" &&
        (showPagination ?? (isControlledPag || hasLocalPagination));

    const resolvedVariant: PaginationVariant = paginationVariant
        ?? (isControlledPag ? "full" : hasLocalPagination ? "compact" : "none");

    // ── Resolve the rows actually rendered ────────────────────────────
    // Priority: local sort/paginate > raw `data` (caller already prepared it,
    // e.g. controlled/server sort — data is pre-sorted by the parent).
    const rowsToRender = useLocalSort
        ? (hasLocalPagination ? local.paginatedData : local.sortedData)
        : (hasLocalPagination ? local.paginatedData : data);

    // ── Row click handler memo ────────────────────────────────────────
    const handleRowClick = useCallback(
        (row: T, index: number) => onRowClick?.(row, index),
        [onRowClick]
    );

    // ── Loading / error short-circuits (skip table chrome entirely) ──
    if (isLoading) {
        return wrapInCard(
            title,
            icon,
            subtitle,
            headerAction,
            <LoadingState message="Loading…" size="md" withCard={false} />,
            className
        );
    }
    if (error) {
        return wrapInCard(
            title,
            icon,
            subtitle,
            headerAction,
            <ErrorState
                title={errorTitle}
                message={error.message}
                onRetry={onErrorRetry ? () => void onErrorRetry() : undefined}
                withCard={false}
            />,
            className
        );
    }

    // ── Compute pagination props for the footer ──────────────────────
    const fullPaginationProps: PaginationProps | null =
        resolvedVariant === "full"
            ? isControlledPag
                ? {
                      total: total!,
                      page: page!,
                      rowsPerPage: rowsPerPage!,
                      onPageChange: onPageChange!,
                      onRowsPerPageChange: onRowsPerPageChange!,
                      rowsPerPageOptions: rowsPerPageOptions ?? [5, 10, 15, 20],
                      disabled: paginationDisabled,
                      hidePageNavigation,
                  }
                : hasLocalPagination
                ? {
                      total: local.sortedData.length,
                      page: local.page,
                      rowsPerPage: localRowsPerPage,
                      onPageChange: local.setPage,
                      onRowsPerPageChange: (n: number) => {
                          setLocalRowsPerPage(n);
                          local.setPage(0);
                      },
                      rowsPerPageOptions: rowsPerPageOptions ?? [5, 10, 15, 20],
                      disabled: paginationDisabled,
                      hidePageNavigation,
                  }
                : null
            : null;

    const totalLocalPages = hasLocalPagination
        ? local.totalPages
        : isControlledPag
        ? Math.max(1, Math.ceil(total! / rowsPerPage!))
        : 1;
    const currentLocalPage = hasLocalPagination ? local.page : (page ?? 0);

    // ── Table body ───────────────────────────────────────────────────
    const tableBody = (
        <ScrollableTable
            pagination={
                paginationEnabled && resolvedVariant === "full" && fullPaginationProps
                    ? fullPaginationProps
                    : undefined
            }
        >
            <Table>
                <TableHeader className={cn("bg-surface-2", stickyHeader && "sticky top-0 z-10")}>
                    <TableRow className="border-b border-border-subtle hover:bg-transparent">
                        {columns.map((column, colIdx) => {
                            const colKey = column.key ?? `col-${colIdx}`;
                            const widthStyle =
                                column.width !== undefined
                                    ? { width: typeof column.width === "number" ? `${column.width}px` : column.width }
                                    : undefined;
                            const headAlign =
                                column.headerAlign ??
                                column.align ??
                                (isNumericType(column.type) ? "right" : undefined);
                            if (column.sortable) {
                                return (
                                    <SortableTableHead
                                        key={colKey}
                                        field={colKey}
                                        currentField={isControlledSort ? (sortField ?? null) : local.sortField}
                                        direction={isControlledSort ? (sortDirection ?? "desc") : local.sortDirection}
                                        onSort={isControlledSort ? handleControlledSort : local.handleColumnSort}
                                        align={headAlign}
                                        className={cn(ds.cellPaddingY, ds.cellPaddingX, column.className)}
                                    >
                                        {column.header}
                                    </SortableTableHead>
                                );
                            }
                            return (
                                <TableHead
                                    key={colKey}
                                    style={widthStyle}
                                    className={cn(
                                        ds.cellPaddingY,
                                        ds.cellPaddingX,
                                        headAlign === "right" && "text-right",
                                        headAlign === "center" && "text-center",
                                        column.className
                                    )}
                                >
                                    <TableHeadLabel align={headAlign}>{column.header}</TableHeadLabel>
                                </TableHead>
                            );
                        })}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rowsToRender.length > 0 ? (
                        rowsToRender.map((row, rowIndex) => {
                            const rowExtraClass =
                                typeof rowClassName === "function"
                                    ? rowClassName(row, rowIndex)
                                    : rowClassName;
                            // Global rank within the full sorted dataset (local mode);
                            // page-local index otherwise.
                            const absoluteIndex = (useLocalSort || hasLocalPagination)
                                ? local.startIndex + rowIndex
                                : rowIndex;
                            const rowKey = getRowKey ? getRowKey(row, rowIndex) : rowIndex;
                            const rowClick = onRowClick
                                ? () => handleRowClick(row, rowIndex)
                                : undefined;
                            const rowClasses = cn(
                                "border-b border-border-subtle last:border-b-0 hover:bg-surface-2 transition-colors",
                                onRowClick && "cursor-pointer",
                                rowExtraClass
                            );
                            const cells = columns.map((column, colIdx) => {
                                const raw =
                                    typeof column.accessor === "function"
                                        ? undefined
                                        : row[column.accessor];
                                const align =
                                    column.align ??
                                    (isNumericType(column.type) ? "right" : undefined);
                                return (
                                    <TableCell
                                        key={column.key ?? `col-${colIdx}`}
                                        className={cn(
                                            ds.cellPaddingY,
                                            ds.cellPaddingX,
                                            ds.textSize,
                                            "text-text-primary",
                                            cellTypeClass(column.type, raw),
                                            align === "right" && "text-right",
                                            align === "center" && "text-center",
                                            column.className
                                        )}
                                    >
                                        {renderCellContent(column, row, rowIndex, absoluteIndex)}
                                    </TableCell>
                                );
                            });
                            return rowMotion ? (
                                <motion.tr
                                    key={rowKey}
                                    onClick={rowClick}
                                    className={rowClasses}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.15,
                                        delay: Math.min(rowIndex, 24) * 0.015,
                                    }}
                                >
                                    {cells}
                                </motion.tr>
                            ) : (
                                <TableRow key={rowKey} onClick={rowClick} className={rowClasses}>
                                    {cells}
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="py-8 border-none">
                                <div className="flex flex-col items-center justify-center text-center">
                                    <Database className="w-10 h-10 mb-3 text-text-tertiary" />
                                    <p className="text-text-secondary text-sm mb-1">{emptyMessage}</p>
                                    {emptyDescription && (
                                        <p className="text-text-tertiary text-xs">{emptyDescription}</p>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </ScrollableTable>
    );

    // ── Compact pagination footer (rendered below the scrollable area)
    const compactFooter =
        paginationEnabled && resolvedVariant === "compact" ? (
            <TablePaginationFooter
                page={currentLocalPage}
                totalPages={totalLocalPages}
                onPageChange={hasLocalPagination ? local.setPage : (onPageChange ?? (() => {}))}
            />
        ) : null;

    const tableContent = (
        <div className={cn("w-full h-full flex flex-col", className)}>
            {toolbar && (
                <div className="px-4 py-3 border-b border-border-subtle">{toolbar}</div>
            )}
            {tableBody}
            {compactFooter}
        </div>
    );

    return wrapInCard(title, icon, subtitle, headerAction, tableContent, undefined);
}

// ─── Internal helpers ─────────────────────────────────────────────────

const EMPTY: never[] = [];

const NUMERIC_COLUMN_TYPES: ReadonlySet<ColumnType> = new Set([
    "numeric",
    "fees",
    "change",
]);

/** A `numeric`/`fees`/`change` column — defaults to right-aligned. */
function isNumericType(type?: ColumnType): boolean {
    return type !== undefined && NUMERIC_COLUMN_TYPES.has(type);
}

/** `0x1234…abcd` — applied automatically to `type: "address"` columns. */
function truncateAddress(value: string): string {
    return value.length > 14 ? `${value.slice(0, 6)}…${value.slice(-4)}` : value;
}

/** Style classes auto-derived from a column's `type` (mono, fees gold, signed color). */
function cellTypeClass(type: ColumnType | undefined, rawValue: unknown): string {
    switch (type) {
        case "numeric":
        case "address":
            return "mono";
        case "fees":
            return "mono fees-cell";
        case "change":
            if (typeof rawValue === "number") {
                return cn(
                    "mono",
                    rawValue > 0 && "text-success",
                    rawValue < 0 && "text-danger",
                    rawValue === 0 && "text-text-secondary"
                );
            }
            return "mono";
        default:
            return "";
    }
}

/** Resolves a cell's rendered node: function accessor > `format` > `type` default > raw string. */
function renderCellContent<T>(
    column: Column<T>,
    row: T,
    rowIndex: number,
    absoluteIndex: number
): ReactNode {
    if (typeof column.accessor === "function") {
        return column.accessor(row, rowIndex, absoluteIndex);
    }
    const raw = row[column.accessor];
    if (column.format) return column.format(raw, row);
    if (column.type === "address" && typeof raw === "string") {
        return truncateAddress(raw);
    }
    if (column.type === "change" && typeof raw === "number") {
        return `${raw > 0 ? "+" : ""}${raw}`;
    }
    return String(raw ?? "");
}

function wrapInCard(
    title: ReactNode,
    icon: ReactNode,
    subtitle: ReactNode,
    headerAction: ReactNode,
    body: ReactNode,
    outerClassName: string | undefined,
): ReactNode {
    if (title === undefined || title === null) {
        return body;
    }
    return (
        <Card className={cn("flex flex-col", outerClassName)}>
            <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    {icon && <div className="p-2 bg-brand/10 rounded-lg">{icon}</div>}
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                        {subtitle && <p className="text-text-tertiary text-sm">{subtitle}</p>}
                    </div>
                </div>
                {headerAction && <div className="shrink-0">{headerAction}</div>}
            </div>
            {body}
        </Card>
    );
}
