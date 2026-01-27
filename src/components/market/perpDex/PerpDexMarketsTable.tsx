"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollableTable } from "@/components/common/ScrollableTable";
import { Card } from "@/components/ui/card";
import { Database } from "lucide-react";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { AssetLogo } from "@/components/common";
import { PerpDexAssetWithMarketData } from "@/services/market/perpDex/types";
import { Sprout, AlertCircle } from "lucide-react";

interface PerpDexMarketsTableProps {
    assets: PerpDexAssetWithMarketData[];
    totalAssets: number;
    activeAssets: number;
}

export function PerpDexMarketsTable({ assets, totalAssets, activeAssets }: PerpDexMarketsTableProps) {
    const { format } = useNumberFormat();

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
            <Card>
                <ScrollableTable>
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead>Asset</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>24h</TableHead>
                                <TableHead>Volume</TableHead>
                                <TableHead>OI</TableHead>
                                <TableHead>Funding</TableHead>
                                <TableHead>OI Cap</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assets.length > 0 ? (
                                assets.map((asset) => (
                                    <TableRow
                                        key={asset.name}
                                        className={`hover:bg-white/[0.02] transition-colors ${asset.isDelisted ? 'opacity-50' : ''}`}
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
                </ScrollableTable>
            </Card>
        </div>
    );
}
