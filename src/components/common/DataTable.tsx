"use client";

import { ReactNode, useCallback, useMemo, useState } from "react";
import { Database } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { truncateAddress } from "@/lib/formatters/numberFormatting";
import { type PaginationProps } from "./pagination";
import { ScrollableTable } from "./ScrollableTable";
import { AddressIdenticon } from "./AddressIdenticon";
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
import { Card } from "@/components/ui/card";
import { CardHead } from "./CardHead";
import { SortableTableHead } from "./tables/SortableTableHead";
import { TablePaginationFooter } from "./tables/TablePaginationFooter";
import {
    useSortablePagination,
    type SortDirection,
} from "./tables/useSortablePagination";

// ─── Public types ─────────────────────────────────────────────────────

/** Semantic cell colours available to `Column.tone`. */
export type CellTone = "success" | "danger" | "gold" | "brand" | "muted" | "primary";

// `!` so the tone beats both the base `text-text-primary` and a type colour.
// Literal class names: Tailwind only generates what it can read in source.
const TONE_CLASS: Record<CellTone, string> = {
    success: "!text-success",
    danger: "!text-danger",
    gold: "!text-gold",
    brand: "!text-brand",
    muted: "!text-text-tertiary",
    primary: "!text-text-primary",
};

/**
 * Sémantique d'une colonne — pilote le style (DS minimal) automatiquement.
 * The accessor returns a *value* (formatted string/number); the table styles it.
 * - `numeric` : mono, aligné à droite.
 * - `fees`    : mono + or (gold, medium), aligné à droite — colonne Builder Fees.
 * - `change`  : mono, aligné à droite, couleur signée (vert/rouge). Le signe vient
 *               de la valeur brute (accessor clé) ou de `getSortValue(row)`.
 * - `address` : mono, troncature auto (`0x1234…abcd`) si la valeur est une string.
 * - `rank`    : mono 11px tertiaire, aligné à droite (`#`).
 * - `time`    : mono secondaire, sans retour à la ligne (âge, date).
 * - `code`    : mono, gauche, retour à la ligne permis (noms de champ, types, sélecteurs — tables de doc).
 * - `text` / `custom` (défaut) : aucun style auto — l'accessor rend un composant
 *   déjà stylé (`ModuleAsset`, `StatusBadge`, `AddressDisplay`…).
 */
export type ColumnType =
    | "text"
    | "numeric"
    | "fees"
    | "change"
    | "address"
    | "rank"
    | "time"
    | "code"
    | "custom";

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
     * Semantic colour of a cell, per row — keeps the accessor returning a plain
     * value (e.g. a signed amount whose colour depends on the trade direction).
     * Overrides the sign colour of `type: "change"`.
     */
    tone?: (item: T) => CellTone | undefined;
    /**
     * Formateur optionnel appliqué quand `accessor` est une clé (`keyof T`).
     * Reçoit la valeur brute + la ligne. Ignoré si `accessor` est une fonction
     * (la fonction produit déjà le nœud).
     */
    format?: (value: unknown, row: T) => ReactNode;
}

type Density = "compact" | "comfortable";

interface DensityStyles {
    /** Header cell padding. */
    head: string;
    /** Body cell padding. */
    cell: string;
    /** Body text size. */
    textSize: string;
}

// DS minimal table densities (DS_MINIMAL_SPEC §B1, kit.html TypedDataTable block).
const DENSITY_STYLES: Record<Density, DensityStyles> = {
    comfortable: { head: "px-4 py-2.5", cell: "px-4 py-3", textSize: "text-[13px]" },
    compact:     { head: "px-3 py-2",   cell: "px-3 py-2", textSize: "text-[12px]" },
};

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
     * - `"comfortable"` (default): `px-4 py-3 text-[13px]` — full page tables.
     * - `"compact"`:                `px-3 py-2 text-[12px]` — previews, feeds, tab panels.
     */
    density?: Density;
    /** Sticky table header during vertical scroll. */
    stickyHeader?: boolean;
    /**
     * `table-layout: fixed` — colonnes aux largeurs déclarées (`Column.width`),
     * réparties uniformément. Recommandé pour les tables data-dense afin
     * d'éviter la distribution erratique du `table-layout: auto`.
     */
    fixedLayout?: boolean;
    /** Extra class on the card (e.g. `max-h-[600px]`, grid placement). Never surface/border classes — the table owns its card. */
    className?: string;

    // ── Row interactions ──────────────────────────────────────────────
    /** Click handler invoked when a row is clicked. Adds `cursor-pointer`. */
    onRowClick?: (row: T, index: number) => void;
    /** Extra class on each `<TableRow>`. Function form receives the row + page-local index. */
    rowClassName?: string | ((row: T, index: number) => string);

    // ── Card head (optional) ──────────────────────────────────────────
    // The table always renders its own `<Card>`; `title` adds a `<CardHead>`.
    /** Card title. When set, a `<CardHead>` is rendered above the table. */
    title?: ReactNode;
    /** One-line helper next to the title. Only rendered when `title` is set. */
    subtitle?: ReactNode;
    /** Plain figure pinned right in the head (count, total). Only rendered when `title` is set. */
    tag?: ReactNode;
    /** Right-aligned slot in the head (`SourceBadge`, `DataStatus`, a `<Select>`…). Only rendered when `title` is set. */
    headerAction?: ReactNode;
    /** "View all →" link target in the head (previews of a full page). Only rendered when `title` is set. */
    viewAllHref?: string;
    /** Label of the "View all →" link. Defaults to "View all". */
    viewAllLabel?: string;

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
 * - **Card head**: the table always renders its own `<Card>`; pass `title`
 *   (and optionally `subtitle`/`tag`/`headerAction`) to add the `<CardHead>`.
 *   Filters/search/sub-tabs go in `toolbar`, never in a wrapping card.
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
    density = "comfortable",
    stickyHeader = false,
    fixedLayout = false,
    className,
    // Row
    onRowClick,
    rowClassName,
    // Card head
    title,
    subtitle,
    tag,
    headerAction,
    viewAllHref,
    viewAllLabel,
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
    const ds = DENSITY_STYLES[density];
    const head: CardHeadSlots = { title, subtitle, tag, headerAction, viewAllHref, viewAllLabel };

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

    // Stable per `columns` so the sort memo in useSortablePagination only
    // re-sorts when data / sort / columns change — an inline callback re-sorted
    // the whole dataset on every render. Field → column lookup is precomputed.
    const getSortValue = useMemo(() => {
        const byField = new Map<string, Column<T>>();
        columns.forEach((c, i) => {
            const k = c.key ?? `col-${i}`;
            if (!byField.has(k)) byField.set(k, c); // first match wins, as .find() did
        });
        return (row: T, field: string): number | string => {
            const col = byField.get(field);
            if (!col) return "";
            if (col.getSortValue) return col.getSortValue(row);
            if (typeof col.accessor === "string" || typeof col.accessor === "number" || typeof col.accessor === "symbol") {
                const v = row[col.accessor as keyof T];
                return typeof v === "number" ? v : String(v ?? "");
            }
            // Function accessor without explicit getSortValue: fall back to its rendered text.
            const rendered = (col.accessor as (item: T, index: number) => ReactNode)(row, 0);
            return typeof rendered === "string" || typeof rendered === "number" ? rendered : "";
        };
    }, [columns]);

    // Local sort+pagination engine (used when `paginate` or any sortable column).
    const local = useSortablePagination<T, string>({
        data: useLocalSort || hasLocalPagination ? data : EMPTY,
        itemsPerPage: hasLocalPagination
            ? localRowsPerPage
            : (itemsPerPage ?? rowsPerPage ?? 10),
        getSortValue,
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
    // The toolbar stays mounted through loading/error so tabs, filters and
    // refresh controls never vanish while a new slice of data is fetched.
    const toolbarStrip = toolbar ? (
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-border-subtle">
            {toolbar}
        </div>
    ) : null;

    if (isLoading) {
        return wrapInCard(
            head,
            <>
                {toolbarStrip}
                <LoadingState message="Loading…" size="md" withCard={false} minHeight="min-h-[300px]" />
            </>,
            className
        );
    }
    if (error) {
        return wrapInCard(
            head,
            <>
                {toolbarStrip}
                <ErrorState
                    title={errorTitle}
                    message={error.message}
                    onRetry={onErrorRetry ? () => void onErrorRetry() : undefined}
                    withCard={false}
                    minHeight="min-h-[300px]"
                />
            </>,
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
            <Table className={cn(fixedLayout && "table-fixed")}>
                <TableHeader className={cn(stickyHeader && "sticky top-0 z-10 bg-surface")}>
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
                                        style={widthStyle}
                                        className={cn(ds.head, column.className)}
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
                                        ds.head,
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
                                "border-b border-border-subtle last:border-b-0 hover:bg-surface-2/60 transition-colors",
                                onRowClick && "cursor-pointer",
                                rowExtraClass
                            );
                            const cells = columns.map((column, colIdx) => {
                                // Raw value drives the sign colour of `change` cells:
                                // the row field for key accessors, else `getSortValue`.
                                const raw =
                                    typeof column.accessor === "function"
                                        ? column.getSortValue?.(row)
                                        : row[column.accessor];
                                const align =
                                    column.align ??
                                    (isNumericType(column.type) ? "right" : undefined);
                                return (
                                    <TableCell
                                        key={column.key ?? `col-${colIdx}`}
                                        className={cn(
                                            ds.cell,
                                            ds.textSize,
                                            "text-text-primary",
                                            cellTypeClass(column.type, raw),
                                            column.tone && toneClass(column.tone(row)),
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
        <>
            {toolbarStrip}
            {tableBody}
            {compactFooter}
        </>
    );

    return wrapInCard(head, tableContent, className);
}

// ─── Internal helpers ─────────────────────────────────────────────────

const EMPTY: never[] = [];

const NUMERIC_COLUMN_TYPES: ReadonlySet<ColumnType> = new Set([
    "numeric",
    "fees",
    "change",
    "rank",
]);

/** A `numeric`/`fees`/`change`/`rank` column — defaults to right-aligned. */
function isNumericType(type?: ColumnType): boolean {
    return type !== undefined && NUMERIC_COLUMN_TYPES.has(type);
}

/** Style classes auto-derived from a column's `type` (mono, fees gold, signed color). */
function cellTypeClass(type: ColumnType | undefined, rawValue: unknown): string {
    switch (type) {
        case "numeric":
        case "address":
            return "mono whitespace-nowrap";
        case "rank":
            return "mono text-[11px] !text-text-tertiary";
        case "time":
            return "mono whitespace-nowrap !text-text-secondary";
        case "code":
            return "mono break-words";
        case "fees":
            return "mono whitespace-nowrap font-medium !text-gold";
        case "change":
            if (typeof rawValue === "number") {
                return cn(
                    "mono whitespace-nowrap",
                    rawValue > 0 && TONE_CLASS.success,
                    rawValue < 0 && TONE_CLASS.danger,
                    rawValue === 0 && "!text-text-secondary"
                );
            }
            return "mono whitespace-nowrap";
        default:
            return "";
    }
}

function toneClass(tone: CellTone | undefined): string | undefined {
    return tone ? TONE_CLASS[tone] : undefined;
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
        return (
            <span className="inline-flex items-center gap-2 align-middle">
                <AddressIdenticon address={raw} size={18} />
                {truncateAddress(raw)}
            </span>
        );
    }
    if (column.type === "change" && typeof raw === "number") {
        return `${raw > 0 ? "+" : ""}${raw}`;
    }
    return String(raw ?? "");
}

interface CardHeadSlots {
    title: ReactNode;
    subtitle: ReactNode;
    tag: ReactNode;
    headerAction: ReactNode;
    viewAllHref: string | undefined;
    viewAllLabel: string | undefined;
}

/** Every table sits on its own `<Card>`; `title` adds the shared `<CardHead>`. */
function wrapInCard(head: CardHeadSlots, body: ReactNode, className: string | undefined): ReactNode {
    const hasHead = head.title !== undefined && head.title !== null;
    return (
        <Card interactive={false} className={cn("flex flex-col min-w-0", className)}>
            {hasHead && (
                <CardHead
                    title={head.title}
                    subtitle={head.subtitle}
                    tag={head.tag}
                    actions={head.headerAction}
                    href={head.viewAllHref}
                    viewAllLabel={head.viewAllLabel}
                />
            )}
            {body}
        </Card>
    );
}
