"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { TypedDataTable, TokenAvatar, type Column } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Input } from "@/components/ui/input";
import {
  formatNumber,
  formatMetricValue,
  formatPrice,
} from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import type { NumberFormatType } from "@/store/number-format.store";
import type { SpotToken } from "@/services/market/spot/types";
import type {
  UseSpotDirectoryResult,
  SpotDirectoryTab,
} from "@/services/market/spot/hooks/useSpotDirectory";
import { isBridged } from "@/services/market/spot/bridged";

function buildColumns(format: NumberFormatType): Column<SpotToken>[] {
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
      header: "Token",
      sortable: true,
      getSortValue: (t) => t.name.toLowerCase(),
      accessor: (t) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <TokenAvatar assetName={t.name} kind="spot" size="md" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-primary truncate max-w-[200px]">
              {t.name}
            </div>
            <div className="mono text-[10px] text-text-tertiary truncate">
              {t.name}/USDC{isBridged(t.name) ? " · bridged" : ""}
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
      key: "marketCap",
      header: "Market cap",
      type: "numeric",
      sortable: true,
      getSortValue: (t) => (isBridged(t.name) ? -1 : t.marketCap),
      accessor: (t) =>
        isBridged(t.name)
          ? "—"
          : `$${formatNumber(t.marketCap, format, { maximumFractionDigits: 0 })}`,
    },
    {
      key: "supply",
      header: "Supply",
      type: "numeric",
      sortable: true,
      getSortValue: (t) => t.supply,
      accessor: (t) =>
        formatMetricValue(t.supply, {
          format: "US",
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
  ];
}

interface SpotDirectoryTableProps {
  directory: UseSpotDirectoryResult;
}

/** Full token directory — client-side search/sort/pagination over one fetch. */
export function SpotDirectoryTable({ directory }: SpotDirectoryTableProps) {
  const router = useRouter();
  const { format } = useNumberFormat();

  const {
    rows,
    isLoading,
    error,
    search,
    setSearch,
    tab,
    setTab,
    totalCount,
    strictCount,
  } = directory;

  const handleRowClick = useCallback(
    (t: SpotToken) => {
      router.push(`/market/spot/${encodeURIComponent(t.name)}`);
    },
    [router]
  );

  const fmt = (n: number) => n.toLocaleString("en-US");
  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[160px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
        <Input
          placeholder="Search token…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm bg-transparent border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-brand/50"
        />
      </div>
      <PillTabs
        variant="text"
        tabs={[
          { value: "all", label: `All ${fmt(totalCount)}` },
          { value: "strict", label: `Strict ${fmt(strictCount)}` },
        ]}
        activeTab={tab}
        onTabChange={(v) => setTab(v as SpotDirectoryTab)}
      />
      <span className="text-text-tertiary text-xs ml-auto shrink-0">
        {rows.length} token{rows.length !== 1 ? "s" : ""}
      </span>
    </div>
  );

  return (
    <div className="min-w-0 bg-surface border border-border-subtle rounded-lg">
      <TypedDataTable<SpotToken>
        data={rows}
        columns={buildColumns(format)}
        // marketIndex, not tokenId — the list is one row per MARKET and a
        // token can back several pairs (HYPE appears 4×, same tokenId).
        getRowKey={(t) => String(t.marketIndex)}
        isLoading={isLoading && rows.length === 0}
        error={error}
        errorTitle="Failed to load tokens"
        emptyMessage="No tokens found"
        emptyDescription="Try adjusting your search or filters."
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
