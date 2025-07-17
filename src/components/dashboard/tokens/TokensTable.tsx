import { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Database, Loader2 } from "lucide-react";
import { formatNumber } from "@/lib/formatting";
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
            className={`${isActive ? "text-[#f9e370] hover:text-[#f9e370]" : "text-white hover:text-white"} font-normal p-0 flex items-center justify-start w-full`}
        >
            {label}
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    </TableHead>
));

TableHeaderCell.displayName = 'TableHeaderCell';

// Composant pour l'état vide
const EmptyState = memo(() => (
    <TableRow>
        <TableCell colSpan={3} className="text-center py-8">
            <div className="flex flex-col items-center justify-center">
                <Database className="w-10 h-10 mb-4 text-[#83E9FF4D]" />
                <p className="text-white text-lg">Aucun token disponible</p>
                <p className="text-[#FFFFFF80] text-sm mt-2">Vérifiez plus tard</p>
            </div>
        </TableCell>
    </TableRow>
));

EmptyState.displayName = 'EmptyState';

// Composant pour une ligne de token
const TokenRow = memo(({ token, type, format }: TokenRowProps & { format: NumberFormatType }) => (
    <TableRow className="border-b border-[#FFFFFF1A] hover:bg-[#051728] transition-colors">
        <TableCell className="py-2 pl-4">
            <div className="flex items-center gap-2">
                <TokenIcon src={token.logo || null} name={token.name} size="sm" />
                <span className="text-white text-sm">{token.name}</span>
            </div>
        </TableCell>
        <TableCell className="py-2 pl-4">
            <div className="text-white text-sm">
                {type === "spot"
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
                    })}
            </div>
        </TableCell>
        <TableCell className="py-2 pl-4 pr-4">
            <div className="text-sm" style={{color: token.change24h < 0 ? '#FF4D4F' : '#52C41A'}}>
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
                <Loader2 className="h-8 w-8 animate-spin text-[#83E9FF]" />
            </div>
        );
    }

    return (
        <Card className="w-full h-full p-0 bg-[#051728E5] border-2 border-[#83E9FF4D] hover:border-[#83E9FF80] transition-colors shadow-[0_4px_24px_0_rgba(0,0,0,0.25)] backdrop-blur-sm overflow-hidden rounded-lg flex flex-col">
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-[#83E9FF4D] scrollbar-track-transparent flex-1">
                <Table className="h-full">
                    <TableHeader>
                        <TableRow className="border-none bg-[#051728]">
                            <TableHeaderCell
                                label="Name"
                                onClick={handleSort("name")}
                                isActive={activeSort === "name"}
                                className="text-white font-normal py-1 bg-[#051728] pl-4 w-[35%]"
                            />
                            <TableHeaderCell
                                label="Price"
                                onClick={handleSort("price")}
                                isActive={activeSort === "price"}
                                className="text-white font-normal py-1 bg-[#051728] pl-4 w-[20%]"
                            />
                            <TableHeaderCell
                                label="24h"
                                onClick={handleSort("change24h")}
                                isActive={activeSort === "change24h"}
                                className="text-white font-normal py-1 bg-[#051728] pl-4 w-[20%]"
                            />
                        </TableRow>
                    </TableHeader>
                    <TableBody className="bg-[#051728]">
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
        </Card>
    );
});

TokensTable.displayName = 'TokensTable'; 