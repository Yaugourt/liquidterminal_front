"use client";

import { useState, memo, useCallback, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ArrowUpDown, Database, Loader2 } from "lucide-react";
import { formatNumber, formatMetricValue, formatPrice, formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { useRouter } from "next/navigation";
import { useSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { useNumberFormat } from "@/store/number-format.store";

import { Pagination, TokenIcon, formatPriceChange } from "@/components/common";
import {
    SpotToken,
    PerpToken,
    SpotSortableFields,
} from "./types";
import { PerpSortableFields, PerpMarketData } from "@/services/market/perp/types";
import { SpotToken as SpotTokenService } from "@/services/market/spot/types";

interface UniversalTokenTableProps {
    market: 'spot' | 'perp';
    mode?: 'full' | 'compact';
    strict?: boolean; // Only for spot market
    searchQuery?: string;
}

interface TableHeaderCellProps {
    label: string;
    onClick?: () => void;
    className?: string;
    isActive?: boolean;
}

// Composant pour l'en-tête de colonne
const TableHeaderCell = memo(({ label, onClick, className, isActive }: TableHeaderCellProps) => (
    <TableHead className={className}>
        <Button
            variant="ghost"
            onClick={onClick}
            disabled={!onClick}
            className={`${isActive ? "text-brand-accent" : "text-text-secondary"} p-0 flex items-center justify-start gap-1 hover:text-white hover:bg-transparent text-[10px] font-semibold uppercase tracking-wider disabled:hover:text-text-secondary disabled:cursor-default`}
        >
            {label}
            {onClick && <ArrowUpDown className="h-3 w-3" />}
        </Button>
    </TableHead>
));

TableHeaderCell.displayName = 'TableHeaderCell';

// Composant pour l'état vide
const EmptyState = memo(() => (
    <TableRow>
        <TableCell colSpan={6} className="text-center py-8">
            <div className="flex flex-col items-center justify-center">
                <Database className="w-10 h-10 mb-3 text-text-muted" />
                <p className="text-text-secondary text-sm mb-1">Aucun token disponible</p>
                <p className="text-text-muted text-xs">Vérifiez plus tard</p>
            </div>
        </TableCell>
    </TableRow>
));

EmptyState.displayName = 'EmptyState';

export function UniversalTokenTable({
    market,
    mode = 'full',
    strict = false,
    searchQuery = ''
}: UniversalTokenTableProps) {
    const router = useRouter();
    const { format } = useNumberFormat();

    // Configuration par défaut selon le mode
    const initialSortField = mode === 'compact' ? 'change24h' : 'volume';

    const [sortField, setSortField] = useState<SpotSortableFields | PerpSortableFields>(initialSortField);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [pageSize, setPageSize] = useState(mode === 'compact' ? 5 : 10);
    const [page, setPage] = useState(1);

    // Forcer pageSize à 5 si compact
    useEffect(() => {
        if (mode === 'compact') {
            setPageSize(5);
        }
    }, [mode]);

    //--- Hooks d'acquisition de données ---
    // Note: On appelle les deux hooks pour respecter les règles des hooks, 
    // même si on n'utilise qu'un seul jeu de données.

    // Spot Data
    const spotResult = useSpotTokens({
        limit: pageSize,
        page: mode === 'compact' ? 1 : page,
        sortBy: sortField as SpotSortableFields,
        sortOrder,
        strict: market === 'spot' ? strict : false
    });

    // Perp Data
    const perpResult = usePerpMarkets({
        limit: pageSize,
        defaultParams: {
            sortBy: sortField as PerpSortableFields,
            sortOrder: sortOrder,
        }
    });

    // Sélection des données actives
    const rawTokens = market === 'spot' ? spotResult.data : perpResult.data;
    const total = market === 'spot' ? spotResult.total : perpResult.total;
    const isLoading = market === 'spot' ? spotResult.isLoading : perpResult.isLoading;
    const error = market === 'spot' ? spotResult.error : perpResult.error;
    const currentPage = market === 'spot' ? page : perpResult.page;

    // Filtrage local si recherche (uniquement pour mode full qui gère la recherche locale en plus)
    // Note: Idéalement la recherche devrait être serveur, mais ici on reprend la logique existante
    // Pour le mode full, TokenTable faisait une récuperation de TOUS les tokens pour filtrer.
    // On va simplifier pour l'instant et filtrer sur la page courante si pas de support recherche serveur
    // OU si on veut reproduire exactement TokenTable, on doit appeler useSpotTokens avec limit 1000...
    // Pour l'instant, on applique le filtre sur les tokens reçus si searchQuery est présent.

    const tokens = rawTokens.filter(token =>
        !searchQuery || token.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    //--- Handlers ---

    const handlePageChange = (newPage: number) => {
        if (mode === 'compact') return;

        if (market === 'spot') {
            setPage(newPage + 1);
        } else if (perpResult.updateParams) {
            perpResult.updateParams({ page: newPage + 1 });
        }
    };

    const handleRowsPerPageChange = (newRowsPerPage: number) => {
        if (mode === 'compact') return;

        setPageSize(newRowsPerPage);
        if (market === 'spot') {
            setPage(1);
        } else if (perpResult.updateParams) {
            perpResult.updateParams({
                page: 1,
                limit: newRowsPerPage
            });
        }
    };

    const handleSort = useCallback((field: SpotSortableFields | PerpSortableFields) => {
        if (market === 'spot') {
            if (sortField === field) {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                setPage(1);
            } else {
                setSortField(field);
                setSortOrder("desc");
                setPage(1);
            }
        } else if (perpResult.updateParams) {
            if (sortField === field) {
                const newOrder = sortOrder === "asc" ? "desc" : "asc";
                setSortOrder(newOrder);
                perpResult.updateParams({
                    sortBy: field as PerpSortableFields,
                    sortOrder: newOrder,
                    page: 1
                });
            } else {
                setSortField(field);
                setSortOrder("desc");
                perpResult.updateParams({
                    sortBy: field as PerpSortableFields,
                    sortOrder: "desc",
                    page: 1
                });
            }
        }
    }, [market, sortField, sortOrder, perpResult]);

    const handleTokenClick = useCallback((tokenName: string) => {
        const basePath = market === 'spot' ? '/market/spot' : '/market/perp';
        router.push(`${basePath}/${encodeURIComponent(tokenName)}`);
    }, [router, market]);

    //--- Render Helpers ---

    const formatVolumeCompact = (value: number) => {
        // Format compact pour le mode compact: $1.2M
        return formatLargeNumber(value, { prefix: '$', decimals: 2, suffix: '' }).replace(/([0-9])([KMB])$/, '$1 $2');
    };

    //--- Loading / Error States ---

    if (isLoading && !tokens.length) {
        return (
            <div className={`w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden ${mode === 'compact' ? 'h-full' : ''}`}>
                <div className={`flex justify-center items-center ${mode === 'compact' ? 'h-full' : 'h-[400px]'}`}>
                    <Loader2 className="h-6 w-6 animate-spin text-brand-accent" />
                </div>
            </div>
        );
    }

    if (error && mode === 'compact') {
        return (
            <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl shadow-black/20 overflow-hidden h-full">
                <div className="flex justify-center items-center h-full">
                    <p className="text-rose-400 text-sm">Une erreur est survenue</p>
                </div>
            </div>
        );
    }

    //--- Main Render ---

    return (
        <div className={`w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden ${mode === 'compact' ? 'h-full flex flex-col' : ''}`}>
            <div className={`overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent ${mode === 'compact' ? 'flex-1' : ''}`}>
                <Table className={mode === 'compact' ? 'h-full' : ''}>
                    <TableHeader>
                        <TableRow className="border-b border-border-subtle hover:bg-transparent">
                            <TableHeaderCell
                                label="Name"
                                className={`py-3 px-3 ${mode === 'compact' ? 'w-[35%]' : (market === 'spot' ? 'w-[16.66%]' : 'w-[17%]')}`}
                            />
                            <TableHeaderCell
                                label="Price"
                                onClick={mode === 'full' && market === 'perp' ? () => handleSort("price") : undefined}
                                isActive={market === 'perp' && sortField === "price"}
                                className={`py-3 px-3 ${mode === 'compact' ? 'w-[20%]' : 'w-[10%]'}`}
                            />

                            {/* Colonne 3 */}
                            {mode === 'compact' ? (
                                market === 'spot' ? (
                                    <TableHeaderCell
                                        label="Volume"
                                        onClick={() => handleSort("volume")}
                                        isActive={sortField === "volume"}
                                        className="py-3 px-3 w-[20%]"
                                    />
                                ) : (
                                    <TableHeaderCell
                                        label="24h"
                                        onClick={() => handleSort("change24h")}
                                        isActive={sortField === "change24h"}
                                        className="py-3 px-3 w-[20%]"
                                    />
                                )
                            ) : (
                                <TableHeaderCell
                                    label="24h"
                                    onClick={() => handleSort("change24h")}
                                    isActive={sortField === "change24h"}
                                    className="py-3 px-3 w-[10%]"
                                />
                            )}

                            {/* Colonne 4 et plus (Full mode ou derniere colonne compact) */}
                            {mode === 'full' ? (
                                <>
                                    <TableHeaderCell
                                        label="Volume"
                                        onClick={() => handleSort("volume")}
                                        isActive={sortField === "volume"}
                                        className={`py-3 px-3 ${market === 'spot' ? 'w-[12%]' : 'w-[20%]'}`}
                                    />
                                    {market === 'spot' ? (
                                        <>
                                            <TableHeaderCell
                                                label="Market Cap"
                                                onClick={() => handleSort("marketCap")}
                                                isActive={sortField === "marketCap"}
                                                className="py-3 px-3 w-[20%]"
                                            />
                                            <TableHeaderCell
                                                label="Supply"
                                                className="py-3 px-3 w-[12%]"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <TableHeaderCell
                                                label="Open Interest"
                                                onClick={() => handleSort("openInterest")}
                                                isActive={sortField === "openInterest"}
                                                className="py-3 px-3 w-[20%]"
                                            />
                                            <TableHeaderCell
                                                label="Funding Rate"
                                                className="py-3 px-3 w-[11%]"
                                            />
                                        </>
                                    )}
                                </>
                            ) : (
                                // Compact Mode - Dernière colonne
                                market === 'spot' ? (
                                    <TableHeaderCell
                                        label="24h"
                                        onClick={() => handleSort("change24h")}
                                        isActive={sortField === "change24h"}
                                        className="py-3 px-3 w-[20%]"
                                    />
                                ) : (
                                    <TableHeaderCell
                                        label="Open Interest"
                                        onClick={() => handleSort("openInterest")}
                                        isActive={sortField === "openInterest"}
                                        className="py-3 px-3 w-[20%]"
                                    />
                                )
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tokens && tokens.length > 0 ? (
                            tokens.map((token, index) => {
                                const isSpot = market === 'spot';
                                const t = token as (SpotToken & PerpToken & SpotTokenService & PerpMarketData);
                                const uniqueKey = isSpot
                                    ? `${market}-${t.name}-${t.tokenId}-${index}`
                                    : `${market}-${t.name}-${t.index}-${index}`;

                                return (
                                    <TableRow
                                        key={uniqueKey}
                                        className={`border-b border-border-subtle hover:bg-white/[0.02] transition-colors cursor-pointer`}
                                        style={mode === 'compact' ? { height: `${100 / pageSize}%` } : undefined}
                                        onClick={() => handleTokenClick(t.name)}
                                    >
                                        {/* Name */}
                                        <TableCell className="py-3 px-3">
                                            <div className="flex items-center gap-2">
                                                <TokenIcon src={t.logo} name={t.name} size="sm" />
                                                <span className="text-white text-sm font-medium">{t.name}</span>
                                            </div>
                                        </TableCell>

                                        {/* Price */}
                                        <TableCell className="py-3 px-3">
                                            <div className="text-white text-sm">
                                                {mode === 'compact'
                                                    ? formatNumber(t.price, format, { minimumFractionDigits: 0, maximumFractionDigits: 2, currency: '$', showCurrency: true })
                                                    : formatPrice(t.price, format)
                                                }
                                            </div>
                                        </TableCell>

                                        {/* Colonne 3 / 4 etc dependant du mode */}
                                        {mode === 'compact' ? (
                                            // COMPACT MODE
                                            <>
                                                {isSpot ? (
                                                    // Spot Compact: Volume, then 24h
                                                    <>
                                                        <TableCell className="text-white text-sm py-2 px-3">
                                                            {formatVolumeCompact(t.volume)}
                                                        </TableCell>
                                                        <TableCell className="text-sm py-2 px-3">
                                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${t.change24h < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                                {formatPriceChange(t.change24h)}
                                                            </span>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    // Perp Compact: 24h, then OI
                                                    <>
                                                        <TableCell className="text-sm py-2 px-3">
                                                            <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${t.change24h < 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                                {formatPriceChange(t.change24h)}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-white text-sm py-2 px-3">
                                                            {'$' + formatNumber(t.openInterest, format, { showCurrency: false, minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                        </TableCell>
                                                    </>
                                                )}
                                            </>
                                        ) : (
                                            // FULL MODE
                                            // Colonnes: 24h, Volume, (MarketCap/Supply OR OI/Funding)
                                            <>
                                                <TableCell className="py-3 px-3">
                                                    <StatusBadge variant={t.change24h < 0 ? 'error' : 'success'}>
                                                        {t.change24h > 0 ? '+' : ''}{formatNumber(t.change24h, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                                    </StatusBadge>
                                                </TableCell>
                                                <TableCell className="py-3 px-3">
                                                    <div className="text-white text-sm">
                                                        ${formatNumber(t.volume, format)}
                                                    </div>
                                                </TableCell>

                                                {isSpot ? (
                                                    <>
                                                        <TableCell className="py-3 px-3">
                                                            <div className="text-white text-sm">
                                                                ${formatNumber(t.marketCap, format)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-3 px-3">
                                                            <div className="text-white text-sm">
                                                                {formatMetricValue(t.supply, { format: 'US', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                            </div>
                                                        </TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell className="py-3 px-3">
                                                            <div className="text-white text-sm">
                                                                ${formatNumber(t.openInterest, format)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-3 px-3">
                                                            <StatusBadge variant={t.funding >= 0 ? 'success' : 'error'}>
                                                                {t.funding > 0 ? '+' : ''}{formatNumber(t.funding, format, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}%
                                                            </StatusBadge>
                                                        </TableCell>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </TableRow>
                                );
                            })
                        ) : (
                            <EmptyState />
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination intégrée (seulement en mode Full) */}
            {mode === 'full' && (
                <div className="border-t border-border-subtle px-4 py-3">
                    <Pagination
                        total={total}
                        page={currentPage - 1}
                        rowsPerPage={pageSize}
                        onPageChange={handlePageChange}
                        onRowsPerPageChange={handleRowsPerPageChange}
                        rowsPerPageOptions={[5, 10, 15, 20]}
                    />
                </div>
            )}
        </div>
    );
}
