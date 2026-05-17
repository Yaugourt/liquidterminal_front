import { memo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { TypedDataTable, type Column } from "@/components/common";
import { formatNumber, formatLargeNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, NumberFormatType } from "@/store/number-format.store";
import { TokenIcon } from "@/components/common";
import { TokensTableProps } from "@/components/types/dashboard.types";
import type { SpotToken } from "@/services/market/spot/types";
import type { PerpMarketData } from "@/services/market/perp/types";

type TokenRow = SpotToken | PerpMarketData;

function buildColumns(
    format: NumberFormatType,
    compact: boolean,
): Column<TokenRow>[] {
    return [
        {
            key: "name",
            header: "Name",
            sortable: true,
            getSortValue: (row) => row.name,
            accessor: (row) => (
                <div className="flex items-center gap-2">
                    <TokenIcon src={("logo" in row ? row.logo : null)} name={row.name} size="sm" />
                    <span
                        className={
                            compact
                                ? "text-text-primary text-[11px] font-medium"
                                : "text-text-primary text-xs font-medium"
                        }
                    >
                        {row.name}
                    </span>
                </div>
            ),
            className: "w-[35%]",
        },
        {
            key: "price",
            header: "Price",
            sortable: true,
            getSortValue: (row) => row.price,
            accessor: (row) => (
                <div
                    className={
                        compact
                            ? "text-text-primary text-[11px] font-medium"
                            : "text-text-primary text-xs font-medium"
                    }
                >
                    {row.price >= 1_000_000
                        ? formatLargeNumber(row.price, { prefix: "$", decimals: 1 })
                        : row.price >= 1
                            ? formatNumber(row.price, format, {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2,
                                  currency: "$",
                                  showCurrency: true,
                              })
                            : formatNumber(row.price, format, {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 4,
                                  currency: "$",
                                  showCurrency: true,
                              })}
                </div>
            ),
            className: "w-[25%]",
        },
        {
            key: "volume",
            header: "Vol",
            sortable: true,
            getSortValue: (row) => row.volume,
            accessor: (row) => (
                <div
                    className={
                        compact
                            ? "text-text-primary text-[11px] font-medium"
                            : "text-text-primary text-xs font-medium"
                    }
                >
                    {formatLargeNumber(row.volume, { prefix: "$", decimals: 1 })}
                </div>
            ),
            className: "w-[20%]",
        },
        {
            key: "change24h",
            header: "24h",
            sortable: true,
            getSortValue: (row) => row.change24h,
            accessor: (row) => (
                <div
                    className={`flex items-center gap-1 font-medium ${
                        compact ? "text-[11px]" : "text-xs"
                    } ${row.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}
                >
                    {row.change24h >= 0 ? (
                        <TrendingUp size={10} />
                    ) : (
                        <TrendingDown size={10} />
                    )}
                    {row.change24h > 0 ? "+" : ""}
                    {row.change24h.toFixed(2)}%
                </div>
            ),
            className: "w-[20%]",
        },
    ];
}

export const TokensTable = memo(
    ({
        data,
        isLoading,
        onSort,
        activeSort = "change24h",
        sortDirection = "desc",
        compact = false,
    }: TokensTableProps & { activeSort?: string }) => {
        const { format } = useNumberFormat();

        return (
            <TypedDataTable<TokenRow>
                data={(data as TokenRow[]) ?? []}
                columns={buildColumns(format, compact)}
                getRowKey={(row) => row.name}
                isLoading={isLoading}
                emptyMessage="No tokens available"
                density="compact"
                // Controlled sort — parent re-fetches
                onSortChange={(field) => onSort(field)}
                sortField={activeSort}
                sortDirection={sortDirection}
            />
        );
    },
);

TokensTable.displayName = "TokensTable";
