"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { TypedDataTable, ModuleAsset, TableStat, TableSearch, type Column } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import {
  formatNumber,
  formatMetricValue,
  formatPrice,
} from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import type { NumberFormatType } from "@/store/number-format.store";
import type { SpotToken, SpotPairMeta } from "@/services/market/spot/types";
import type {
  UseSpotDirectoryResult,
  SpotDirectoryTab,
} from "@/services/market/spot/hooks/useSpotDirectory";
import { useSpotPairMeta } from "@/services/market/spot/hooks/useSpotPairMeta";
import { isBridged } from "@/services/market/spot/bridged";

function buildColumns(
  format: NumberFormatType,
  pairMeta: Record<number, SpotPairMeta> | null
): Column<SpotToken>[] {
  // Market cap from the on-HL CIRCULATING supply when available; the backend
  // value is price × max supply, which produces absurd caps for pre-mint
  // tokens (e.g. XAUT0 in the hundreds of trillions).
  const marketCapOf = (t: SpotToken): number => {
    const circulating = pairMeta?.[t.marketIndex]?.circulatingSupply;
    return circulating != null && circulating > 0 ? t.price * circulating : t.marketCap;
  };

  return [
    {
      key: "rank",
      header: "#",
      type: "rank",
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
          // Real quote asset (USDC / USDT0 / USDH ...) from HL spot meta
          sub={`${t.name}/${pairMeta?.[t.marketIndex]?.quote ?? "USDC"}${isBridged(t.name) ? " · bridged" : ""}`}
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
      accessor: (t) => `$${formatNumber(t.volume, format, { maximumFractionDigits: 0 })}`,
    },
    {
      key: "marketCap",
      header: "Market cap",
      type: "numeric",
      sortable: true,
      getSortValue: (t) => (isBridged(t.name) ? -1 : marketCapOf(t)),
      accessor: (t) =>
        isBridged(t.name)
          ? "—"
          : `$${formatNumber(marketCapOf(t), format, { maximumFractionDigits: 0 })}`,
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
  // Real quote assets + circulating supplies (HL spotMetaAndAssetCtxs)
  const { pairMeta } = useSpotPairMeta();

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
      columns={buildColumns(format, pairMeta)}
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
