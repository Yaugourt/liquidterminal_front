"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Copy, Check } from "lucide-react";
import { TypedDataTable, TokenAvatar, type Column } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { Input } from "@/components/ui/input";
import { compactUsd, compactHype } from "@/lib/formatters/numberFormatting";
import { formatDateTime } from "@/lib/formatters/dateFormatting";
import { useDateFormat } from "@/store/date-format.store";
import type { DateFormatType } from "@/store/date-format.store";
import type { AuctionInfo } from "@/services/market/auction/types";
import type {
  UseAuctionHistoryResult,
  AuctionEraTab,
} from "@/services/market/auction/hooks/useAuctionHistory";

const shortAddr = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

function AddressCell({
  address,
  copied,
  onCopy,
}: {
  address: string;
  copied: boolean;
  onCopy: (a: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`/explorer/address/${address}`}
        onClick={(e) => e.stopPropagation()}
        className="mono text-xs text-brand hover:text-text-primary transition-colors"
      >
        {shortAddr(address)}
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onCopy(address);
        }}
        className="group p-1 rounded transition-colors"
        aria-label="Copy address"
      >
        {copied ? (
          <Check className="h-3 w-3 text-success" />
        ) : (
          <Copy className="h-3 w-3 text-text-tertiary opacity-60 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    </div>
  );
}

function buildColumns(
  dateFormat: DateFormatType,
  copiedAddress: string | null,
  onCopy: (a: string) => void
): Column<AuctionInfo>[] {
  return [
    {
      key: "time",
      header: "Date",
      sortable: true,
      getSortValue: (a) => a.time,
      accessor: (a) => (
        <span className="text-sm text-text-secondary whitespace-nowrap">
          {formatDateTime(a.time, dateFormat)}
        </span>
      ),
    },
    {
      key: "name",
      header: "Token",
      sortable: true,
      getSortValue: (a) => a.name.toLowerCase(),
      accessor: (a) => (
        <div className="flex items-center gap-2.5 min-w-0">
          <TokenAvatar assetName={a.name} kind="spot" size="md" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-text-primary truncate max-w-[160px]">
              {a.name}
            </div>
            <div className="mono text-[10px] text-text-tertiary truncate">
              index {a.index}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "deployer",
      header: "Deployer",
      accessor: (a) => (
        <AddressCell
          address={a.deployer}
          copied={copiedAddress === a.deployer}
          onCopy={onCopy}
        />
      ),
    },
    {
      key: "tokenId",
      header: "Token ID",
      accessor: (a) => (
        <AddressCell
          address={a.tokenId}
          copied={copiedAddress === a.tokenId}
          onCopy={onCopy}
        />
      ),
    },
    {
      key: "deployGas",
      header: "Winning bid",
      align: "right",
      headerAlign: "right",
      sortable: true,
      getSortValue: (a) => parseFloat(a.deployGas),
      accessor: (a) => {
        const gas = parseFloat(a.deployGas);
        if (gas === 0) {
          return <span className="mono text-xs text-text-tertiary">genesis</span>;
        }
        return (
          <span className="mono text-sm font-medium text-gold whitespace-nowrap">
            {a.currency === "HYPE" ? `${compactHype(gas)} HYPE` : compactUsd(gas)}
          </span>
        );
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
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const { rows, isLoading, error, search, setSearch, tab, setTab, stats } = history;

  const handleCopy = useCallback(async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 1200);
    } catch {}
  }, []);

  const handleRowClick = useCallback(
    (a: AuctionInfo) => {
      router.push(`/market/spot/${encodeURIComponent(a.name)}`);
    },
    [router]
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[160px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary" />
        <Input
          placeholder="Search token, deployer, token id…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-sm bg-transparent border-border-subtle text-text-primary placeholder:text-text-tertiary focus:border-brand/50"
        />
      </div>
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
      <span className="text-text-tertiary text-xs ml-auto shrink-0">
        {rows.length} deploy{rows.length !== 1 ? "s" : ""}
      </span>
    </div>
  );

  return (
    <div className="min-w-0 bg-surface border border-border-subtle rounded-lg">
      <TypedDataTable<AuctionInfo>
        data={rows}
        columns={buildColumns(dateFormat, copiedAddress, handleCopy)}
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
        headerFill={false}
        onRowClick={handleRowClick}
        toolbar={toolbar}
      />
    </div>
  );
}
