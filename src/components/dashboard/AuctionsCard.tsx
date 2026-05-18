"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { Gavel, ArrowUpRight } from "lucide-react";
import { TypedDataTable, type Column } from "@/components/common";
import { useAuctions } from "@/services/market/auction";
import type { AuctionInfo } from "@/services/market/auction/types";

/**
 * AuctionsCard — déploiements de tokens récents (auctions).
 *
 * Sorti de l'onglet « Trending » fourre-tout : une auction n'est pas un
 * token tendance, c'est de l'activité de déploiement — sa place est dans
 * la zone Activité live.
 */

const TOP_N = 8;

function fmtDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const AuctionsCard = memo(function AuctionsCard() {
  const { auctions, isLoading, error } = useAuctions({ currency: "ALL", limit: 30 });

  const rows = useMemo(
    () => [...auctions].sort((a, b) => b.time - a.time).slice(0, TOP_N),
    [auctions],
  );

  const columns: Column<AuctionInfo>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Token",
        accessor: (a) => (
          <span className="font-medium text-text-primary">{a.name}</span>
        ),
      },
      { key: "deployer", header: "Deployer", type: "address", accessor: "deployer" },
      {
        key: "time",
        header: "Date",
        type: "numeric",
        accessor: (a) => (
          <span className="text-text-tertiary">{fmtDate(a.time)}</span>
        ),
      },
      {
        key: "gas",
        header: "Deploy Cost",
        type: "numeric",
        accessor: (a) => (
          <span>
            {parseFloat(a.deployGas).toFixed(2)}{" "}
            <span className="text-text-tertiary">{a.currency}</span>
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <TypedDataTable<AuctionInfo>
      title="Recent Auctions"
      icon={<Gavel size={14} className="text-brand" />}
      headerAction={
        <Link
          href="/market/spot/auction"
          className="flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors"
        >
          View all
          <ArrowUpRight size={12} />
        </Link>
      }
      data={rows}
      columns={columns}
      getRowKey={(a) => `${a.tokenId}-${a.index}`}
      isLoading={isLoading}
      error={error}
      emptyMessage="No recent auctions"
      emptyDescription=""
      density="compact"
      rowMotion
    />
  );
});
