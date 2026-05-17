"use client";

import { useState, useCallback, useEffect } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatNumber, formatMetricValue, formatPrice, compactUsd } from "@/lib/formatters/numberFormatting";
import { useRouter } from "next/navigation";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { useNumberFormat } from "@/store/number-format.store";

import { TokenIcon, formatPriceChange, TypedDataTable, type Column } from "@/components/common";
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

    useEffect(() => {
        if (mode === 'compact') {
            setPageSize(5);
        }
    }, [mode]);

    const spotResult = useSpotTokens({
        limit: pageSize,
        page: mode === 'compact' ? 1 : page,
        sortBy: sortField as SpotSortableFields,
        sortOrder,
        strict: market === 'spot' ? strict : false
    });

    const perpResult = usePerpMarkets({
        limit: pageSize,
        defaultParams: {
            sortBy: sortField as PerpSortableFields,
            sortOrder: sortOrder,
        }
    });

    const rawTokens = market === 'spot' ? spotResult.data : perpResult.data;
    const total = market === 'spot' ? spotResult.total : perpResult.total;
    const isLoading = market === 'spot' ? spotResult.isLoading : perpResult.isLoading;
    const error = market === 'spot' ? spotResult.error : perpResult.error;
    const currentPage = market === 'spot' ? page : perpResult.page;

    const tokens = (rawTokens as TokenRow[]).filter(token =>
        !searchQuery || token.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePageChange = useCallback((newPage: number) => {
        if (mode === 'compact') return;
        if (market === 'spot') {
            setPage(newPage + 1);
        } else if (perpResult.updateParams) {
            perpResult.updateParams({ page: newPage + 1 });
        }
    }, [mode, market, perpResult]);

    const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
        if (mode === 'compact') return;
        setPageSize(newRowsPerPage);
        if (market === 'spot') {
            setPage(1);
        } else if (perpResult.updateParams) {
            perpResult.updateParams({ page: 1, limit: newRowsPerPage });
        }
    }, [mode, market, perpResult]);

    const handleSortChange = useCallback((field: string, direction: SortDirection) => {
        const typedField = field as SpotSortableFields | PerpSortableFields;
        setSortField(typedField);
        setSortOrder(direction);
        if (market === 'spot') {
            setPage(1);
        } else if (perpResult.updateParams) {
            perpResult.updateParams({
                sortBy: typedField as PerpSortableFields,
                sortOrder: direction,
                page: 1
            });
        }
    }, [market, perpResult]);

    const handleTokenClick = useCallback((tokenName: string) => {
        const basePath = market === 'spot' ? '/market/spot' : '/market/perp';
        router.push(`${basePath}/${encodeURIComponent(tokenName)}`);
    }, [router, market]);

    // ── Column definitions vary by mode + market ──────────────────────

    // Name column — shared
    const nameCol: Column<TokenRow> = {
        key: "name",
        header: "Name",
        width: mode === 'compact' ? '35%' : (market === 'spot' ? '16.66%' : '17%'),
        accessor: (t) => (
            <div className="flex items-center gap-2">
                <TokenIcon src={t.logo} name={t.name} size="sm" />
                <span className="text-text-primary text-sm font-medium">{t.name}</span>
            </div>
        ),
    };

    // Price column — shared
    const priceCol: Column<TokenRow> = {
        key: "price",
        header: "Price",
        type: "numeric",
        sortable: mode === 'full' && market === 'perp',
        width: mode === 'compact' ? '20%' : '10%',
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
        width: mode === 'compact' ? '20%' : '10%',
        accessor: (t) => (
            mode === 'compact'
                ? (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${t.change24h < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
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
        width: market === 'spot' ? '12%' : '20%',
        accessor: (t) => (
            mode === 'compact'
                ? compactUsd(t.volume)
                : `$${formatNumber(t.volume, format)}`
        ),
    };

    // Build columns array per mode × market
    let columns: Column<TokenRow>[];

    if (mode === 'compact') {
        if (market === 'spot') {
            // Compact spot: Name, Price, Volume, 24h
            columns = [
                nameCol,
                priceCol,
                { ...volumeCol, width: '20%' },
                { ...change24hCol, sortable: true },
            ];
        } else {
            // Compact perp: Name, Price, 24h, OI
            columns = [
                nameCol,
                priceCol,
                { ...change24hCol, width: '20%' },
                {
                    key: "openInterest",
                    header: "Open Interest",
                    type: "numeric",
                    sortable: true,
                    width: '20%',
                    accessor: (t) => `$${formatNumber(t.openInterest, format, { showCurrency: false, minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
                },
            ];
        }
    } else {
        // Full mode
        if (market === 'spot') {
            columns = [
                nameCol,
                priceCol,
                change24hCol,
                volumeCol,
                {
                    key: "marketCap",
                    header: "Market Cap",
                    type: "numeric",
                    sortable: true,
                    width: '20%',
                    accessor: (t) => `$${formatNumber(t.marketCap, format)}`,
                },
                {
                    key: "supply",
                    header: "Supply",
                    type: "numeric",
                    width: '12%',
                    accessor: (t) => formatMetricValue(t.supply, { format: 'US', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                },
            ];
        } else {
            columns = [
                nameCol,
                priceCol,
                change24hCol,
                volumeCol,
                {
                    key: "openInterest",
                    header: "Open Interest",
                    type: "numeric",
                    sortable: true,
                    width: '20%',
                    accessor: (t) => `$${formatNumber(t.openInterest, format)}`,
                },
                {
                    key: "funding",
                    header: "Funding Rate",
                    width: '11%',
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
            emptyMessage="Aucun token disponible"
            emptyDescription="Vérifiez plus tard"
            className={mode === 'compact' ? 'h-full flex flex-col' : undefined}
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
