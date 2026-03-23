import { memo, useCallback } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHeader, TableRow, SortableTableHead, TableHead } from "@/components/ui/table";
import { formatNumber, formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { TokenIcon } from '@/components/common';
import { TokenRowProps, TokensTableProps } from "@/components/types/dashboard.types";
import { TableEmptyState, TableLoadingState } from "@/components/ui/table-states";


// eslint-disable-next-line @typescript-eslint/no-unused-vars -- type is required by TokenRowProps but not used in this component
const TokenRow = memo(({ token, type, format, compact }: TokenRowProps & { format: NumberFormatType; compact?: boolean }) => (
    <TableRow className="hover:bg-white/[0.02] group cursor-pointer">
        <TableCell className={compact ? "py-1 pl-3" : "py-1.5 pl-4"}>
            <div className="flex items-center gap-2">
                <TokenIcon src={token.logo || null} name={token.name} size="sm" />
                <span className={compact ? "text-white text-[11px] font-medium" : "text-white text-xs font-medium"}>{token.name}</span>
            </div>
        </TableCell>
        <TableCell className={compact ? "py-1 pl-3" : "py-1.5 pl-4"}>
            <div className={compact ? "text-white text-[11px] font-medium" : "text-white text-xs font-medium"}>
                {token.price >= 1000000
                    ? formatLargeNumber(token.price, { prefix: '$', decimals: 1 })
                    : token.price >= 1
                        ? formatNumber(token.price, format, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                            currency: '$',
                            showCurrency: true
                        })
                        : formatNumber(token.price, format, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 4,
                            currency: '$',
                            showCurrency: true
                        })
                }
            </div>
        </TableCell>
        <TableCell className={compact ? "py-1 pl-3" : "py-1.5 pl-4"}>
            <div className={compact ? "text-white text-[11px] font-medium" : "text-white text-xs font-medium"}>
                {formatLargeNumber(token.volume, { prefix: '$', decimals: 1 })}
            </div>
        </TableCell>
        <TableCell className={compact ? "py-1 pl-3 pr-3" : "py-1.5 pl-4 pr-4"}>
            <div className={`flex items-center gap-1 font-medium ${compact ? "text-[11px]" : "text-xs"} ${token.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {token.change24h >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {token.change24h > 0 ? '+' : ''}{token.change24h.toFixed(2)}%
            </div>
        </TableCell>
    </TableRow>
));

TokenRow.displayName = 'TokenRow';

export const TokensTable = memo(({ type, data, isLoading, onSort, activeSort = "change24h", sortDirection = "desc", compact = false, headerVariant = "default" }: TokensTableProps & { activeSort?: string }) => {
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

    const headerCellClass = headerVariant === "compact"
        ? "pl-3 py-1.5 w-[35%] text-[10px]"
        : "pl-4 w-[35%]";
    const headerCellClass2 = headerVariant === "compact"
        ? "pl-3 py-1.5 w-[25%] text-[10px]"
        : "pl-4 w-[25%]";
    const headerCellClass3 = headerVariant === "compact"
        ? "pl-3 py-1.5 w-[20%] text-[10px]"
        : "pl-4 w-[20%]";
    const sortableClass = headerVariant === "compact" ? "pl-3 py-1.5" : "pl-4";

    if (isLoading) {
        return (
            <div className="w-full h-full flex flex-col">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className={headerCellClass}>Name</TableHead>
                                <TableHead className={headerCellClass2}>Price</TableHead>
                                <TableHead className={headerCellClass3}>Vol</TableHead>
                                <TableHead className={headerCellClass3}>24h</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableLoadingState colSpan={4} rows={5} />
                        </TableBody>
                    </Table>
                </div>
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
                                sortDirection={sortDirection}
                                highlight="gold"
                                className={`${sortableClass} w-[35%] ${headerVariant === "compact" ? "text-[10px]" : ""}`}
                            />
                            <SortableTableHead
                                label="Price"
                                onClick={handleSort("price")}
                                isActive={activeSort === "price"}
                                sortDirection={sortDirection}
                                highlight="gold"
                                className={`${sortableClass} w-[25%] ${headerVariant === "compact" ? "text-[10px]" : ""}`}
                            />
                            <SortableTableHead
                                label="Vol"
                                onClick={handleSort("volume")}
                                isActive={activeSort === "volume"}
                                sortDirection={sortDirection}
                                highlight="gold"
                                className={`${sortableClass} w-[20%] ${headerVariant === "compact" ? "text-[10px]" : ""}`}
                            />
                            <SortableTableHead
                                label="24h"
                                onClick={handleSort("change24h")}
                                isActive={activeSort === "change24h"}
                                sortDirection={sortDirection}
                                highlight="gold"
                                className={`${sortableClass} w-[20%] ${headerVariant === "compact" ? "text-[10px]" : ""}`}
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
                                    compact={compact}
                                />
                            ))
                        ) : (
                            <TableEmptyState colSpan={4} title="No tokens available" />
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
});

TokensTable.displayName = 'TokensTable';
