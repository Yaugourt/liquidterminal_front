"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { TypedDataTable, TokenAvatar, type Column } from "@/components/common";
import { Input } from "@/components/ui/input";
import { formatNumber, formatPrice } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import type { NumberFormatType } from "@/store/number-format.store";
import type { PerpMarketData } from "@/services/market/perp/types";
import type { UsePerpDirectoryResult } from "@/services/market/perp/hooks/usePerpDirectory";

function buildColumns(format: NumberFormatType): Column<PerpMarketData>[] {
  return [
    {
      key: "rank",
      header: "#",
      align: "right",
      headerAlign: "right",
      accessor: (_t, _i, absoluteIndex) => (
        <span className="mono text-text-tertiary text-xs">{absoluteIndex + 1}</span>
      ),
    },
    {
      key: "name",
      header: "Market",
      sortable: true,
      getSortValue: (t) => t.name.toLowerCase(),
      accessor: (t) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <TokenAvatar assetName={t.name} kind="auto" size="md" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-primary truncate max-w-[200px]">
              {t.name}
            </div>
            <div className="mono text-[10px] text-text-tertiary truncate">
              {t.name}-PERP · {t.maxLeverage}×
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      type: "numeric",
      sortable: true,
      getSortValue: (t) => t.price,
      accessor: (t) => formatPrice(t.price, format),
    },
    {
      key: "change24h",
      header: "24h",
      type: "change",
      sortable: true,
      getSortValue: (t) => t.change24h,
      accessor: (t) => `${t.change24h.toFixed(2)}%`,
    },
    {
      key: "volume",
      header: "Volume · 24h",
      type: "numeric",
      sortable: true,
      getSortValue: (t) => t.volume,
      accessor: (t) => `$${formatNumber(t.volume, format, { maximumFractionDigits: 0 })}`,
    },
    {
      key: "openInterest",
      header: "Open interest",
      type: "numeric",
      sortable: true,
      getSortValue: (t) => t.openInterest,
      accessor: (t) => `$${formatNumber(t.openInterest, format, { maximumFractionDigits: 0 })}`,
    },
    {
      key: "funding",
      header: "Funding · 1h",
      align: "right",
      headerAlign: "right",
      sortable: true,
      getSortValue: (t) => t.funding,
      // Raw HL funding is an hourly fraction — render as a signed percentage (×100).
      accessor: (t) => (
        <span className={`mono ${t.funding >= 0 ? "text-success" : "text-danger"}`}>
          {t.funding >= 0 ? "+" : ""}
          {(t.funding * 100).toFixed(4)}%
        </span>
      ),
    },
  ];
}

interface PerpDirectoryTableProps {
  directory: UsePerpDirectoryResult;
}

/** Full perp directory — client-side search/sort/pagination over one fetch. */
export function PerpDirectoryTable({ directory }: PerpDirectoryTableProps) {
  const router = useRouter();
  const { format } = useNumberFormat();

  const { rows, isLoading, error, search, setSearch, totalCount } = directory;

  const handleRowClick = useCallback(
    (t: PerpMarketData) => {
      router.push(`/market/perp/${encodeURIComponent(t.name)}`);
    },
    [router]
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[160px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
        <Input
          placeholder="Search market…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm bg-transparent border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-brand/50"
        />
      </div>
      <span className="text-text-tertiary text-xs ml-auto shrink-0">
        {rows.length} of {totalCount.toLocaleString("en-US")} market
        {totalCount !== 1 ? "s" : ""}
      </span>
    </div>
  );

  return (
    <div className="min-w-0 bg-surface border border-border-subtle rounded-lg">
      <TypedDataTable<PerpMarketData>
        data={rows}
        columns={buildColumns(format)}
        getRowKey={(t) => String(t.index)}
        isLoading={isLoading && rows.length === 0}
        error={error}
        errorTitle="Failed to load perp markets"
        emptyMessage="No markets found"
        emptyDescription="Try adjusting your search."
        initialSort={{ field: "volume", direction: "desc" }}
        paginate
        itemsPerPage={20}
        rowsPerPageOptions={[20, 50, 100]}
        paginationVariant="full"
        headerFill={false}
        onRowClick={handleRowClick}
        toolbar={toolbar}
      />
    </div>
  );
}
