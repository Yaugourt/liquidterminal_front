import { memo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow, SortableTableHead, TableHead } from "@/components/ui/table";
import { Database, Loader2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber, formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { TokenIcon } from '@/components/common';
import { TokenRowProps, TokensTableProps } from "@/components/types/dashboard.types";


// Composant pour l'état vide
const EmptyState = memo(() => (
    <TableRow className="hover:bg-transparent border-none">
        <TableCell colSpan={4} className="text-center py-8">
            <div className="flex flex-col items-center justify-center">
                <Database className="w-10 h-10 mb-4 text-text-muted" />
                <p className="text-text-secondary text-sm">No tokens available</p>
            </div>
        </TableCell>
    </TableRow>
));

EmptyState.displayName = 'EmptyState';

// Composant pour une ligne de token
const TokenRow = memo(({ token, type, format }: TokenRowProps & { format: NumberFormatType }) => (
    <TableRow className="hover:bg-white/[0.02] group cursor-pointer">
        <TableCell className="py-3 pl-4">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-[#1A1F2A] p-1 border border-border-hover group-hover:scale-110 transition-transform">
                        <TokenIcon src={token.logo || null} name={token.name} size="sm" />
                    </div>
                </div>
                <span className="text-white text-sm font-medium">{token.name}</span>
            </div>
        </TableCell>
        <TableCell className="py-3 pl-4">
            <div className="text-white text-sm font-medium">
                {token.price >= 1000000 
                    ? formatLargeNumber(token.price, { prefix: '$', decimals: 2, forceDecimals: true })
                    : type === "spot"
                        ? formatNumber(token.price, format, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 4,
                            currency: '$',
                            showCurrency: true
                        })
                        : formatNumber(token.price, format, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 3,
                            currency: '$',
                            showCurrency: true
                        })
                }
            </div>
        </TableCell>
        <TableCell className="py-3 pl-4">
            <div className="text-text-secondary text-sm">
                {formatLargeNumber(token.volume, { prefix: '$', decimals: 1, forceDecimals: true })}
            </div>
        </TableCell>
        <TableCell className="py-3 pl-4 pr-4">
            <div className={`text-xs font-medium px-2 py-1 rounded-md inline-block ${token.change24h >= 0 ? 'bg-brand-gold/10 text-brand-gold' : 'bg-rose-500/20 text-rose-400'}`}>
                {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
            </div>
        </TableCell>
    </TableRow>
));

TokenRow.displayName = 'TokenRow';

export const TokensTable = memo(({ type, data, isLoading, onSort, activeSort = "change24h" }: TokensTableProps & { activeSort?: string }) => {
    const { format } = useNumberFormat();

    const formatValue = useCallback((value: number) => {
        return formatNumber(value, format, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
            currency: '$',
            showCurrency: true
        });
    }, [format]);

    const handleSort = useCallback((field: string) => () => {
        onSort(field);
    }, [onSort]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand-accent" />
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="overflow-x-auto custom-scrollbar flex-1">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <SortableTableHead
                                label="Name"
                                onClick={handleSort("name")}
                                isActive={activeSort === "name"}
                                highlight="gold"
                                className="pl-4 w-[35%]"
                            />
                            <SortableTableHead
                                label="Price"
                                onClick={handleSort("price")}
                                isActive={activeSort === "price"}
                                highlight="gold"
                                className="pl-4 w-[25%]"
                            />
                            <SortableTableHead
                                label="Vol"
                                onClick={handleSort("volume")}
                                isActive={activeSort === "volume"}
                                highlight="gold"
                                className="pl-4 w-[20%]"
                            />
                            <TableHead className="pl-4 w-[20%]">
                                <Button
                                    variant="tableHeaderSortable"
                                    onClick={handleSort("change24h")}
                                    className="text-brand-gold hover:text-brand-gold/80"
                                >
                                    24h
                                    <ArrowUpDown className="h-3 w-3" />
                                </Button>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data && data.length > 0 ? (
                            data.map((token) => (
                                <TokenRow
                                    key={token.name}
                                    token={token}
                                    type={type}
                                    formatValue={formatValue}
                                    format={format}
                                />
                            ))
                        ) : (
                            <EmptyState />
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
});

TokensTable.displayName = 'TokensTable';
