"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { TypedDataTable, ModuleAsset, TableStat, TableSearch, type Column } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import {
  compactUsd,
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
      type: "rank",
      className: "hidden sm:table-cell",
      accessor: (_t, _i, absoluteIndex) => absoluteIndex + 1,
    },
    {
      key: "name",
      header: "Token",
      className: "max-w-[240px]",
      sortable: true,
      getSortValue: (t) => t.name.toLowerCase(),
      accessor: (t) => (
        <ModuleAsset
          assetName={t.name}
          kind="spot"
          name={t.name}
          sub={`${t.name}/${t.quote ?? "USDC"}${isBridged(t.name) ? " · bridged" : ""}`}
        />
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
      // Phones keep token, price and 24h; the movers boards carry volume there.
      className: "hidden sm:table-cell whitespace-nowrap",
      accessor: (t) => compactUsd(t.volume),
    },
    {
      key: "marketCap",
      header: "Market cap",
      type: "numeric",
      sortable: true,
      // Price × circulating supply from the pair's own context, less the
      // bridge reserve on the token's HyperEVM system address (backend).
      getSortValue: (t) => (isBridged(t.name) ? -1 : t.marketCap),
      className: "hidden sm:table-cell whitespace-nowrap",
      accessor: (t) => (isBridged(t.name) ? "—" : compactUsd(t.marketCap)),
    },
    {
      key: "supply",
      header: "Supply",
      type: "numeric",
      sortable: true,
      getSortValue: (t) => t.supply,
      className: "hidden md:table-cell whitespace-nowrap",
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
    <>
      <TableSearch value={search} onChange={setSearch} placeholder="Search token…" />
      <PillTabs
        variant="text"
        tabs={[
          { value: "all", label: `All ${fmt(totalCount)}` },
          { value: "strict", label: `Strict ${fmt(strictCount)}` },
        ]}
        activeTab={tab}
        onTabChange={(v) => setTab(v as SpotDirectoryTab)}
      />
      <TableStat className="ml-auto" label="Tokens" value={fmt(rows.length)} />
    </>
  );

  return (
    <TypedDataTable<SpotToken>
      className="min-w-0"
      // Remount on tab switch so local pagination resets to page 1
      key={tab}
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
      onRowClick={handleRowClick}
      toolbar={toolbar}
    />
  );
}
