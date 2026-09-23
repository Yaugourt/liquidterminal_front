"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  TypedDataTable,
  ModuleAsset,
  TableSearch,
  TableStat,
  type Column,
} from "@/components/common";
import { AddressDisplay } from "@/components/ui/address-display";
import { PillTabs } from "@/components/ui/pill-tabs";
import { compactUsd, compactHype } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useDateFormat } from "@/store/date-format.store";
import type { DateFormatType } from "@/store/date-format.store";
import type { AuctionInfo } from "@/services/market/auction/types";
import type {
  UseAuctionHistoryResult,
  AuctionEraTab,
} from "@/services/market/auction/hooks/useAuctionHistory";

function buildColumns(dateFormat: DateFormatType): Column<AuctionInfo>[] {
  return [
    {
      key: "time",
      header: "Date",
      type: "time",
      sortable: true,
      getSortValue: (a) => a.time,
      accessor: (a) => formatDateTime(a.time, dateFormat),
    },
    {
      key: "name",
      header: "Token",
      sortable: true,
      getSortValue: (a) => a.name.toLowerCase(),
      accessor: (a) => (
        <ModuleAsset assetName={a.name} kind="spot" name={a.name} sub={`index ${a.index}`} />
      ),
    },
    {
      key: "deployer",
      header: "Deployer",
      accessor: (a) => <AddressDisplay address={a.deployer} />,
    },
    {
      key: "tokenId",
      header: "Token ID",
      accessor: (a) => <AddressDisplay address={a.tokenId} copyMessage="Token ID copied to clipboard" />,
    },
    {
      key: "deployGas",
      header: "Winning bid",
      type: "fees",
      sortable: true,
      getSortValue: (a) => parseFloat(a.deployGas),
      tone: (a) => (parseFloat(a.deployGas) === 0 ? "muted" : undefined),
      accessor: (a) => {
        const gas = parseFloat(a.deployGas);
        if (gas === 0) return "genesis";
        return a.currency === "HYPE" ? `${compactHype(gas)} HYPE` : compactUsd(gas);
      },
    },
  ];
}

interface AuctionHistoryTableProps {
  history: UseAuctionHistoryResult;
}

/**
 * Full HIP-1 deploy record — client-side search/sort/pagination over the one
 * fetch held by `useAuctionHistory`. Era tabs scope the gas column to a single
 * unit (sorting bids across HYPE and USDC eras would compare apples to
 * oranges, so "All" is for browsing, the era tabs for ranking).
 */
export function AuctionHistoryTable({ history }: AuctionHistoryTableProps) {
  const router = useRouter();
  const { format: dateFormat } = useDateFormat();
  const { rows, isLoading, error, search, setSearch, tab, setTab, stats } = history;

  const handleRowClick = useCallback(
    (a: AuctionInfo) => {
      router.push(`/market/spot/${encodeURIComponent(a.name)}`);
    },
    [router]
  );

  const toolbar = (
    <>
      <TableSearch value={search} onChange={setSearch} placeholder="Search token, deployer, token id…" />
      <PillTabs
        variant="text"
        tabs={[
          { value: "all", label: `All ${stats.totalCount}` },
          { value: "hype", label: `HYPE era ${stats.hypeCount}` },
          { value: "usdc", label: `USDC era ${stats.usdcCount}` },
        ]}
        activeTab={tab}
        onTabChange={(v) => setTab(v as AuctionEraTab)}
      />
      <TableStat className="ml-auto" label={rows.length !== 1 ? "Deploys" : "Deploy"} value={rows.length} />
    </>
  );

  return (
    <TypedDataTable<AuctionInfo>
      data={rows}
      columns={buildColumns(dateFormat)}
      getRowKey={(a) => `${a.tokenId}-${a.time}`}
      isLoading={isLoading && rows.length === 0}
      error={error}
      errorTitle="Failed to load auctions"
      emptyMessage="No deploys found"
      emptyDescription="Try adjusting your search or era filter."
      initialSort={{ field: "time", direction: "desc" }}
      paginate
      itemsPerPage={20}
      rowsPerPageOptions={[20, 50, 100]}
      paginationVariant="full"
      onRowClick={handleRowClick}
      toolbar={toolbar}
      className="min-w-0"
    />
  );
}
