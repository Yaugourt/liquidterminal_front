"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatNumber, formatMetricValue, formatPrice, compactUsd } from "@/lib/formatters/numberFormatting";
import { useRouter } from "next/navigation";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { useNumberFormat } from "@/store/number-format.store";

import { TokenAvatar, formatPriceChange, TypedDataTable, type Column } from "@/components/common";
import {
    SpotToken,
    PerpToken,
    SpotSortableFields,
} from "./types";
import { PerpSortableFields, PerpMarketData } from "@/services/market/perp/types";
import { SpotToken as SpotTokenService } from "@/services/market/spot/types";
import type { SortDirection } from "@/components/common";

interface UniversalTokenTableProps {
    market: 'spot' | 'perp';
    mode?: 'full' | 'compact';
    strict?: boolean; // Only for spot market
    searchQuery?: string;
}

type TokenRow = SpotToken & PerpToken & SpotTokenService & PerpMarketData;

/** Full-directory fetch size used while a search query is active. */
const SEARCH_FETCH_LIMIT = 1000;

export function UniversalTokenTable({
    market,
    mode = 'full',
    strict = false,
    searchQuery = ''
}: UniversalTokenTableProps) {
    const router = useRouter();
    const { format } = useNumberFormat();

    const initialSortField = 'volume';

    const [sortField, setSortField] = useState<SpotSortableFields | PerpSortableFields>(initialSortField);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [pageSize, setPageSize] = useState(mode === 'compact' ? 5 : 10);
    const [page, setPage] = useState(1);

    const trimmedSearch = searchQuery.trim().toLowerCase();
    const hasSearch = trimmedSearch.length > 0;

    useEffect(() => {
        if (mode === 'compact') {
            setPageSize(5);
        }
    }, [mode]);

    // The sort state is isolated per market type: the spot fetch must never
    // receive perp-only fields (e.g. openInterest → backend 400 loop).
    const spotSortBy: SpotSortableFields =
        market === 'spot' ? (sortField as SpotSortableFields) : 'volume';
    const perpSortBy: PerpSortableFields =
        market === 'perp' ? (sortField as PerpSortableFields) : 'volume';

    // While searching, fetch the whole directory once and filter/paginate
    // client-side so the query matches the FULL dataset, not just one page.
    const spotSearching = market === 'spot' && mode === 'full' && hasSearch;
    const spotResult = useSpotTokens({
        limit: spotSearching ? SEARCH_FETCH_LIMIT : pageSize,
        // Local page state only drives the spot fetch when it actually
        // paginates server-side (full spot mode without an active search).
        page: market === 'spot' && mode === 'full' && !hasSearch ? page : 1,
        sortBy: spotSortBy,
        sortOrder,
        strict: market === 'spot' ? strict : false
    });

    const perpResult = usePerpMarkets({
        limit: pageSize,
        defaultParams: {
            sortBy: perpSortBy,
            sortOrder: sortOrder,
        }
    });
    const updatePerpParams = perpResult.updateParams;

    // Reset pagination to page 1 whenever the search query changes, and swap
    // the perp fetch between server pagination and full-directory mode.
    const prevSearchRef = useRef(trimmedSearch);
    useEffect(() => {
        if (prevSearchRef.current === trimmedSearch) return;
        const wasSearching = prevSearchRef.current.length > 0;
        prevSearchRef.current = trimmedSearch;
        setPage(1);
        if (market === 'perp' && mode === 'full' && wasSearching !== hasSearch) {
            updatePerpParams(
                hasSearch
                    ? { limit: SEARCH_FETCH_LIMIT, page: 1 }
                    : { limit: pageSize, page: 1 }
            );
        }
    }, [trimmedSearch, hasSearch, market, mode, pageSize, updatePerpParams]);

    // Strict/All mode switch always restarts from the first page.
    useEffect(() => {
        setPage(1);
    }, [strict]);

    const rawTokens = market === 'spot' ? spotResult.data : perpResult.data;
    const serverTotal = market === 'spot' ? spotResult.total : perpResult.total;
    const isLoading = market === 'spot' ? spotResult.isLoading : perpResult.isLoading;
    const error = market === 'spot' ? spotResult.error : perpResult.error;
    const serverPage = market === 'spot' ? page : perpResult.page;

    // Search filters the full fetched dataset; pagination is then client-side.
    const filteredTokens = hasSearch
        ? (rawTokens as TokenRow[]).filter((token) =>
            token.name.toLowerCase().includes(trimmedSearch)
        )
        : (rawTokens as TokenRow[]);
    const tokens = hasSearch && mode === 'full'
        ? filteredTokens.slice((page - 1) * pageSize, page * pageSize)
        : filteredTokens;
    const total = hasSearch ? filteredTokens.length : serverTotal;
    const currentPage = hasSearch ? page : serverPage;

    const handlePageChange = useCallback((newPage: number) => {
        if (mode === 'compact') return;
        if (hasSearch || market === 'spot') {
            setPage(newPage + 1);
        } else if (updatePerpParams) {
            updatePerpParams({ page: newPage + 1 });
        }
    }, [mode, market, hasSearch, updatePerpParams]);

    const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
        if (mode === 'compact') return;
        setPageSize(newRowsPerPage);
        setPage(1);
        if (market === 'perp' && !hasSearch && updatePerpParams) {
            updatePerpParams({ page: 1, limit: newRowsPerPage });
        }
    }, [mode, market, hasSearch, updatePerpParams]);

    const handleSortChange = useCallback((field: string, direction: SortDirection) => {
        const typedField = field as SpotSortableFields | PerpSortableFields;
        setSortField(typedField);
        setSortOrder(direction);
        setPage(1);
        if (market === 'perp' && updatePerpParams) {
            updatePerpParams({
                sortBy: typedField as PerpSortableFields,
                sortOrder: direction,
                page: 1
            });
        }
    }, [market, updatePerpParams]);

    const handleTokenClick = useCallback((tokenName: string) => {
        const basePath = market === 'spot' ? '/market/spot' : '/market/perp';
        router.push(`${basePath}/${encodeURIComponent(tokenName)}`);
    }, [router, market]);

    // ── Column definitions vary by mode + market ──────────────────────

    // Name column — shared
    const nameCol: Column<TokenRow> = {
        key: "name",
        header: "Name",
        accessor: (t) => (
            <div className="flex items-center gap-2 min-w-0">
                <TokenAvatar
                    assetName={t.name}
                    kind={market === "spot" ? "spot" : "auto"}
                    size="md"
                />
                <span className="text-text-primary text-sm font-medium truncate">{t.name}</span>
            </div>
        ),
    };

    // Price column — shared
    const priceCol: Column<TokenRow> = {
        key: "price",
        header: "Price",
        type: "numeric",
        sortable: mode === 'full' && market === 'perp',
        accessor: (t) => (
            mode === 'compact'
                ? formatNumber(t.price, format, { minimumFractionDigits: 0, maximumFractionDigits: 2, currency: '$', showCurrency: true })
                : formatPrice(t.price, format)
        ),
    };

    // Change 24h
    const change24hCol: Column<TokenRow> = {
        key: "change24h",
        header: "24h",
        sortable: true,
        align: "right",
        accessor: (t) => (
            mode === 'compact'
                ? (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${t.change24h < 0 ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                        {formatPriceChange(t.change24h)}
                    </span>
                ) : (
                    <StatusBadge variant={t.change24h < 0 ? 'error' : 'success'}>
                        {t.change24h > 0 ? '+' : ''}{formatNumber(t.change24h, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                    </StatusBadge>
                )
        ),
    };

    // Volume column
    const volumeCol: Column<TokenRow> = {
        key: "volume",
        header: "Volume",
        type: "numeric",
        sortable: true,
        accessor: (t) => (
            mode === 'compact'
                ? compactUsd(t.volume)
                : `$${formatNumber(t.volume, format)}`
        ),
    };

    // Build columns array per mode × market
    let columns: Column<TokenRow>[];

    // Percentage widths (summing to 100%) act as distribution hints under auto layout.
    if (mode === 'compact') {
        if (market === 'spot') {
            // Compact spot: Name, Price, Volume, 24h
            columns = [
                { ...nameCol, width: '34%' },
                { ...priceCol, width: '22%' },
                { ...volumeCol, width: '22%' },
                { ...change24hCol, sortable: true, width: '22%' },
            ];
        } else {
            // Compact perp: Name, Price, 24h, OI
            columns = [
                { ...nameCol, width: '30%' },
                { ...priceCol, width: '22%' },
                { ...change24hCol, width: '22%' },
                {
                    key: "openInterest",
                    header: "Open Interest",
                    type: "numeric",
                    sortable: true,
                    width: '26%',
                    accessor: (t) => `$${formatNumber(t.openInterest, format, { showCurrency: false, minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
                },
            ];
        }
    } else {
        // Full mode
        if (market === 'spot') {
            columns = [
                { ...nameCol, width: '22%' },
                { ...priceCol, width: '14%' },
                { ...change24hCol, width: '14%' },
                { ...volumeCol, width: '18%' },
                {
                    key: "marketCap",
                    header: "Market Cap",
                    type: "numeric",
                    sortable: true,
                    width: '18%',
                    accessor: (t) => `$${formatNumber(t.marketCap, format)}`,
                },
                {
                    key: "supply",
                    header: "Supply",
                    type: "numeric",
                    width: '14%',
                    accessor: (t) => formatMetricValue(t.supply, { format: 'US', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                },
            ];
        } else {
            columns = [
                { ...nameCol, width: '22%' },
                { ...priceCol, width: '14%' },
                { ...change24hCol, width: '14%' },
                { ...volumeCol, width: '17%' },
                {
                    key: "openInterest",
                    header: "Open Interest",
                    type: "numeric",
                    sortable: true,
                    width: '17%',
                    accessor: (t) => `$${formatNumber(t.openInterest, format)}`,
                },
                {
                    key: "funding",
                    header: "Funding Rate",
                    align: "right",
                    width: '16%',
                    accessor: (t) => (
                        <StatusBadge variant={t.funding >= 0 ? 'success' : 'error'}>
                            {t.funding > 0 ? '+' : ''}{formatNumber(t.funding, format, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}%
                        </StatusBadge>
                    ),
                },
            ];
        }
    }

    return (
        <TypedDataTable<TokenRow>
            data={tokens}
            columns={columns}
            getRowKey={(t, i) => {
                const isSpot = market === 'spot';
                return isSpot
                    ? `${market}-${t.name}-${t.tokenId}-${i}`
                    : `${market}-${t.name}-${t.index}-${i}`;
            }}
            isLoading={isLoading && !tokens.length}
            error={error ?? null}
            emptyMessage="No tokens available"
            emptyDescription="Check back later"
            className={mode === 'compact' ? 'h-full flex flex-col' : undefined}
            // No fixedLayout: auto layout lets the table exceed the viewport
            // and scroll horizontally on mobile (same treatment as the spot
            // directory table) instead of squeezing columns into overlap.
            // Server-sort
            onSortChange={handleSortChange}
            sortField={sortField}
            sortDirection={sortOrder}
            // Server-pagination (full mode only)
            total={mode === 'full' ? total : undefined}
            page={mode === 'full' ? currentPage - 1 : undefined}
            rowsPerPage={mode === 'full' ? pageSize : undefined}
            onPageChange={mode === 'full' ? handlePageChange : undefined}
            onRowsPerPageChange={mode === 'full' ? handleRowsPerPageChange : undefined}
            rowsPerPageOptions={[5, 10, 15, 20]}
            paginationVariant={mode === 'full' ? "full" : "none"}
            onRowClick={(t) => handleTokenClick(t.name)}
        />
    );
}
