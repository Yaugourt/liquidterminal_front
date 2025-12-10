import { memo, useCallback } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Database, Loader2 } from "lucide-react";
import { formatNumber, formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { TokenIcon } from '@/components/common';
import { 
  TableHeaderCellProps, 
  TokenRowProps, 
  TokensTableProps 
} from "@/components/types/dashboard.types";

// Composant pour l'en-tête de colonne
const TableHeaderCell = memo(({ label, onClick, className, isActive }: TableHeaderCellProps & { isActive?: boolean }) => (
    <TableHead className={className}>
        <Button
            variant="ghost"
            onClick={onClick}
            className={`${isActive ? "text-brand-gold hover:text-brand-gold" : "text-zinc-400 hover:text-white"} font-medium p-0 flex items-center justify-start w-full text-xs uppercase tracking-wider`}
        >
            {label}
            <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
        </Button>
    </TableHead>
));

TableHeaderCell.displayName = 'TableHeaderCell';

// Composant pour l'état vide
const EmptyState = memo(() => (
    <TableRow className="hover:bg-transparent border-none">
        <TableCell colSpan={4} className="text-center py-8">
            <div className="flex flex-col items-center justify-center">
                <Database className="w-10 h-10 mb-4 text-zinc-600" />
                <p className="text-zinc-400 text-sm">No tokens available</p>
            </div>
        </TableCell>
    </TableRow>
));

EmptyState.displayName = 'EmptyState';

// Composant pour une ligne de token
const TokenRow = memo(({ token, type, format }: TokenRowProps & { format: NumberFormatType }) => (
    <TableRow className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer">
        <TableCell className="py-3 pl-4">
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-[#1A1F2A] p-1 border border-white/10 group-hover:scale-110 transition-transform">
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
            <div className="text-zinc-400 text-sm">
                {formatLargeNumber(token.volume, { prefix: '$', decimals: 1, forceDecimals: true })}
            </div>
        </TableCell>
        <TableCell className="py-3 pl-4 pr-4">
            <div className={`text-xs font-medium px-2 py-1 rounded-md inline-block ${token.change24h >= 0 ? 'bg-brand-accent/10 text-brand-accent' : 'bg-rose-500/20 text-rose-400'}`}>
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
                        <TableRow className="border-b border-white/5 hover:bg-transparent">
                            <TableHeaderCell
                                label="Name"
                                onClick={handleSort("name")}
                                isActive={activeSort === "name"}
                                className="pl-4 w-[35%]"
                            />
                            <TableHeaderCell
                                label="Price"
                                onClick={handleSort("price")}
                                isActive={activeSort === "price"}
                                className="pl-4 w-[25%]"
                            />
                            <TableHeaderCell
                                label="Vol"
                                onClick={handleSort("volume")}
                                isActive={activeSort === "volume"}
                                className="pl-4 w-[20%]"
                            />
                            <TableHeaderCell
                                label="24h"
                                onClick={handleSort("change24h")}
                                isActive={activeSort === "change24h"}
                                className="pl-4 w-[20%]"
                            />
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
