"use client";

import { useCallback, useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    SortableTableHead,
} from "@/components/ui/table";
import { Database } from "lucide-react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { AssetLogo } from "@/components/common";
import { PerpDexAssetWithMarketData } from "@/services/market/perpDex/types";
import { Sprout, AlertCircle } from "lucide-react";

type PerpDexMarketsSortField = "dayNtlVlm" | "openInterest" | "priceChange24h";

function toSortNumber(value: number | undefined | null): number {
    if (value === undefined || value === null) return 0;
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) ? n : 0;
}

function getSortNumericValue(
    field: PerpDexMarketsSortField,
    asset: PerpDexAssetWithMarketData
): number {
    switch (field) {
        case "dayNtlVlm":
            return toSortNumber(asset.dayNtlVlm);
        case "openInterest":
            return toSortNumber(asset.openInterest);
        case "priceChange24h":
            return toSortNumber(asset.priceChange24h);
        default:
            return 0;
    }
}

interface PerpDexMarketsTableProps {
    assets: PerpDexAssetWithMarketData[];
    totalAssets: number;
    activeAssets: number;
}

export function PerpDexMarketsTable({ assets, totalAssets, activeAssets }: PerpDexMarketsTableProps) {
    const { format } = useNumberFormat();

    const [sortField, setSortField] = useState<PerpDexMarketsSortField>("dayNtlVlm");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const sortedAssets = useMemo(() => {
        return [...assets].sort((a, b) => {
            const va = getSortNumericValue(sortField, a);
            const vb = getSortNumericValue(sortField, b);
            let comparison = va - vb;
            if (comparison === 0) {
                comparison = a.name.localeCompare(b.name);
            }
            return sortOrder === "desc" ? -comparison : comparison;
        });
    }, [assets, sortField, sortOrder]);

    const handleSort = useCallback(
        (field: PerpDexMarketsSortField) => {
            if (sortField === field) {
                setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
            } else {
                setSortField(field);
                setSortOrder("desc");
            }
        },
        [sortField]
    );

    const formatFunding = (funding: number | undefined) => {
        if (funding === undefined) return '-';
        const percentage = funding * 100;
        return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(4)}%`;
    };

    const formatPriceChange = (change: number | undefined) => {
        if (change === undefined) return '-';
        return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    };

    const getTicker = (assetName: string) => {
        const parts = assetName.split(':');
        return parts.length > 1 ? parts[1] : assetName;
    };

    const renderAssetBadges = (asset: PerpDexAssetWithMarketData) => {
        const badges = [];

        // Always show leverage
        badges.push(
            <span key="leverage" className="text-label text-text-muted">
                {asset.maxLeverage}x
            </span>
        );

        if (asset.growthMode === 'enabled') {
            badges.push(
                <span key="growth" className="text-emerald-400 text-label flex items-center gap-0.5">
                    <Sprout className="h-2.5 w-2.5" />
                    Growth
                </span>
            );
        }

        if (asset.isDelisted) {
            badges.push(
                <span key="delisted" className="text-rose-400 text-label flex items-center gap-0.5">
                    <AlertCircle className="h-2.5 w-2.5" />
                    Delisted
                </span>
            );
        }

        return <div className="flex items-center gap-2 mt-0.5">{badges}</div>;
    };

    return (
        <div>
            <h2 className="text-xs text-text-secondary font-semibold uppercase tracking-wider mb-4">
                Markets ({activeAssets} active / {totalAssets} total)
            </h2>
            <div className="w-full bg-brand-secondary/60 backdrop-blur-md border border-border-subtle rounded-2xl hover:border-border-hover transition-all shadow-xl shadow-black/20 overflow-hidden">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-border-subtle hover:bg-transparent">
                                <TableHead>Asset</TableHead>
                                <TableHead>Price</TableHead>
                                <SortableTableHead
                                    label="24h"
                                    onClick={() => handleSort("priceChange24h")}
                                    isActive={sortField === "priceChange24h"}
                                    sortDirection={sortField === "priceChange24h" ? sortOrder : undefined}
                                />
                                <SortableTableHead
                                    label="Volume"
                                    onClick={() => handleSort("dayNtlVlm")}
                                    isActive={sortField === "dayNtlVlm"}
                                    sortDirection={sortField === "dayNtlVlm" ? sortOrder : undefined}
                                />
                                <SortableTableHead
                                    label="OI"
                                    onClick={() => handleSort("openInterest")}
                                    isActive={sortField === "openInterest"}
                                    sortDirection={sortField === "openInterest" ? sortOrder : undefined}
                                />
                                <TableHead>Funding</TableHead>
                                <TableHead>OI Cap</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedAssets.length > 0 ? (
                                sortedAssets.map((asset) => (
                                    <TableRow
                                        key={asset.name}
                                        className={`border-b border-border-subtle hover:bg-white/[0.02] transition-colors ${asset.isDelisted ? 'opacity-50' : ''}`}
                                    >
                                        {/* Asset */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <AssetLogo assetName={asset.name} isDelisted={asset.isDelisted} />
                                                <div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-white text-sm font-medium">{getTicker(asset.name)}</span>
                                                        <span className="text-text-muted text-sm">/</span>
                                                        <span className="text-text-muted text-xs">
                                                            {asset.collateralToken}
                                                        </span>
                                                    </div>
                                                    {renderAssetBadges(asset)}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Price */}
                                        <TableCell>
                                            <span className="text-white text-sm font-medium">
                                                {asset.markPx
                                                    ? `$${formatNumber(asset.markPx, format, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                                    : '-'}
                                            </span>
                                        </TableCell>

                                        {/* 24h Change */}
                                        <TableCell>
                                            <span className={`text-sm font-medium ${(asset.priceChange24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {formatPriceChange(asset.priceChange24h)}
                                            </span>
                                        </TableCell>

                                        {/* Volume */}
                                        <TableCell>
                                            <span className="text-white text-sm font-medium">
                                                {asset.dayNtlVlm && asset.dayNtlVlm > 0
                                                    ? formatNumber(asset.dayNtlVlm, format, {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                        currency: '$',
                                                        showCurrency: true
                                                    })
                                                    : '-'}
                                            </span>
                                        </TableCell>

                                        {/* Open Interest */}
                                        <TableCell>
                                            <span className="text-white text-sm font-medium">
                                                {asset.openInterest && asset.openInterest > 0
                                                    ? formatNumber(asset.openInterest, format, {
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                        currency: '$',
                                                        showCurrency: true
                                                    })
                                                    : '-'}
                                            </span>
                                        </TableCell>

                                        {/* Funding */}
                                        <TableCell>
                                            <span className={`text-sm font-medium ${(asset.funding ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {formatFunding(asset.funding)}
                                            </span>
                                        </TableCell>

                                        {/* OI Cap */}
                                        <TableCell>
                                            <span className="text-white text-sm font-medium">
                                                {formatNumber(asset.streamingOiCap, format, {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                    currency: '$',
                                                    showCurrency: true
                                                })}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="flex flex-col items-center justify-center">
                                            <Database className="w-10 h-10 mb-3 text-text-muted" />
                                            <p className="text-text-secondary text-sm mb-1">No markets available</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
