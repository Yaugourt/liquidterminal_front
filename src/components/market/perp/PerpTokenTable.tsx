"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { PerpSortableFields } from "@/services/market/perp/types";
import { formatNumber } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, TrendingUp, BarChart2, Scale } from "lucide-react";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import { Pagination, TokenIcon, getPriceChangeColor, formatPriceChange } from "@/components/common";
import { LoadingState, ErrorState, EmptyState } from "../common/TableStates";
import { COLORS, STYLES } from "../common/constants";
import { PerpToken, SortOrder } from "../common/types";

export const PerpTokenTable = memo(function PerpTokenTable() {
    const router = useRouter();
    const [sortField, setSortField] = useState<PerpSortableFields>("volume");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
    const [pageSize, setPageSize] = useState(10);
    
    const { 
        data: tokens, 
        isLoading, 
        error,
        page,
        totalPages,
        total,
        updateParams
    } = usePerpMarkets({
        limit: pageSize,
        defaultParams: {
            sortBy: sortField,
            sortOrder: sortOrder,
        }
    });
    
    const handleTokenClick = (tokenName: string) => {
        router.push(`/market/perp/${tokenName}`);
    };

    const handleSort = (field: string) => {
        if (!["volume", "openInterest", "change24h"].includes(field)) {
            return;
        }

        const newField = field as PerpSortableFields;
        if (sortField === newField) {
            const newOrder = sortOrder === "asc" ? "desc" : "asc";
            setSortOrder(newOrder);
            updateParams({ 
                sortBy: newField, 
                sortOrder: newOrder,
                page: 1
            });
        } else {
            setSortField(newField);
            setSortOrder("desc");
            updateParams({ 
                sortBy: newField, 
                sortOrder: "desc",
                page: 1
            });
        }
    };
    
    const formatFunding = (funding: number) => {
        const percentage = funding * 100;
        return `${percentage > 0 ? '+' : ''}${percentage.toFixed(4)}%`;
    };

    const isSortable = (field: string): boolean => {
        return ["volume", "openInterest", "change24h"].includes(field);
    };

    const getSortButtonClass = (field: string): string => {
        const isActive = sortField === field;
        return `${STYLES.button.base} ${STYLES.button.sortable} ${
            !isSortable(field) ? 'cursor-default opacity-50' : ''
        } ${isActive ? `text-[${COLORS.primary}]` : `text-[${COLORS.textSecondary}]`}`;
    };
    
    const getColumnIcon = (field: string) => {
        switch (field) {
            case "change24h":
                return <TrendingUp className="mr-1.5 h-3.5 w-3.5 opacity-70" />;
            case "volume":
                return <BarChart2 className="mr-1.5 h-3.5 w-3.5 opacity-70" />;
            case "openInterest":
                return <Scale className="mr-1.5 h-3.5 w-3.5 opacity-70" />;
            default:
                return null;
        }
    };
    
    if (isLoading) {
        return <LoadingState />;
    }

    if (error) {
        return <ErrorState message={error.message} />;
    }

    if (!tokens || tokens.length === 0) {
        return <EmptyState />;
    }
    
    return (
        <div className={STYLES.table.container}>
            <Table>
                <TableHeader>
                    <TableRow className="border-none bg-[#051728]">
                        <TableHead className={`text-[${COLORS.textSecondary}] font-normal py-1 bg-[${COLORS.background}] pl-4`}>
                            <Button
                                variant="ghost"
                                className={`text-[${COLORS.textSecondary}] ${STYLES.button.base}`}
                            >
                                Name
                            </Button>
                        </TableHead>
                        <TableHead className={`text-[${COLORS.textSecondary}] font-normal py-1 bg-[${COLORS.background}]`}>
                            <Button
                                variant="ghost"
                                className={getSortButtonClass("price")}
                            >
                                Price
                            </Button>
                        </TableHead>
                        <TableHead className={`text-[${COLORS.textSecondary}] font-normal py-1 bg-[${COLORS.background}]`}>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("change24h")}
                                className={getSortButtonClass("change24h")}
                            >
                                {getColumnIcon("change24h")}
                                Change
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className={`text-[${COLORS.textSecondary}] font-normal py-1 bg-[${COLORS.background}]`}>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("volume")}
                                className={getSortButtonClass("volume")}
                            >
                                {getColumnIcon("volume")}
                                Volume
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className={`text-[${COLORS.textSecondary}] font-normal py-1 bg-[${COLORS.background}]`}>
                            <Button
                                variant="ghost"
                                onClick={() => handleSort("openInterest")}
                                className={getSortButtonClass("openInterest")}
                            >
                                {getColumnIcon("openInterest")}
                                Open Interest
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </TableHead>
                        <TableHead className={`text-[${COLORS.textSecondary}] font-normal py-1 bg-[${COLORS.background}] pr-4`}>
                            <Button
                                variant="ghost"
                                className={getSortButtonClass("funding")}
                            >
                                Funding Rate
                            </Button>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className={`bg-[${COLORS.background}]`}>
                    {tokens.map((token: PerpToken) => (
                        <TableRow
                            key={token.name}
                            className={STYLES.table.row}
                            onClick={() => handleTokenClick(token.name)}
                        >
                            <TableCell className={`${STYLES.table.cell.base} ${STYLES.table.cell.first}`}>
                                <div className="flex items-center gap-2">
                                    <TokenIcon src={token.logo} name={token.name} size="sm" />
                                    <span className={`text-[${COLORS.neutral}] text-sm`}>{token.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className={`${STYLES.table.cell.base} text-right text-[${COLORS.neutral}] text-sm`}>
                                ${formatNumber(token.price)}
                            </TableCell>
                            <TableCell className={`${STYLES.table.cell.base} text-right text-sm`}>
                                <span className={getPriceChangeColor(token.change24h)}>
                                    {formatPriceChange(token.change24h)}
                                </span>
                            </TableCell>
                            <TableCell className={`${STYLES.table.cell.base} text-right text-[${COLORS.neutral}] text-sm`}>
                                ${formatNumber(token.volume, 'volume')}
                            </TableCell>
                            <TableCell className={`${STYLES.table.cell.base} text-right text-[${COLORS.neutral}] text-sm`}>
                                ${formatNumber(token.openInterest, 'volume')}
                            </TableCell>
                            <TableCell className={`${STYLES.table.cell.base} ${STYLES.table.cell.last} text-right text-sm`}>
                                <span className={getPriceChangeColor(token.funding * 100)}>
                                    {formatPriceChange(token.funding * 100, 4)}
                                </span>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className={`border-t border-[${COLORS.border}] flex items-center`}>
                <div className="w-full px-4 py-3">
                    <Pagination
                        total={total}
                        page={page - 1}
                        rowsPerPage={pageSize}
                        onPageChange={(newPage) => updateParams({ page: newPage + 1 })}
                        onRowsPerPageChange={(newRowsPerPage) => {
                            setPageSize(newRowsPerPage);
                            updateParams({ 
                                page: 1,
                                limit: newRowsPerPage 
                            });
                        }}
                    />
                </div>
            </div>
        </div>
    );
});