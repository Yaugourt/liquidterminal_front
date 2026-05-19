"use client";

import { memo, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, ArrowUpRight } from "lucide-react";
import { TypedDataTable, type Column, TokenIcon } from "@/components/common";
import { useTrendingSpotTokens } from "@/services/market/spot/hooks/useSpotMarket";
import { useTrendingPerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import type { SpotToken } from "@/services/market/spot/types";
import type { PerpMarketData } from "@/services/market/perp/types";
import { compactUsd, formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat, type NumberFormatType } from "@/store/number-format.store";

/**
 * MoversCard — top tokens d'un marché (spot OU perp) sur le Dashboard.
 *
 * Remplace l'ancien onglet « Trending » fourre-tout : spot et perp sont
 * désormais deux cartes distinctes côte à côte, chacune avec les colonnes
 * propres à son marché — perp expose Funding + Open Interest (jusqu'ici
 * absents), spot expose Market Cap.
 */

type Market = "spot" | "perp";
type Row = SpotToken | PerpMarketData;

const TOP_N = 5;

function fmtPrice(price: number, format: NumberFormatType): string {
  if (price >= 1000) {
    return formatNumber(price, format, {
      maximumFractionDigits: 0,
      currency: "$",
      showCurrency: true,
    });
  }
  if (price >= 1) {
    return formatNumber(price, format, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currency: "$",
      showCurrency: true,
    });
  }
  return formatNumber(price, format, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
    currency: "$",
    showCurrency: true,
  });
}

function SignedPct({ value, decimals = 2 }: { value: number; decimals?: number }) {
  const positive = value >= 0;
  return (
    <span className={`mono ${positive ? "text-success" : "text-danger"}`}>
      {positive ? "+" : ""}
      {value.toFixed(decimals)}%
    </span>
  );
}

function TokenCell({ logo, name }: { logo: string | null; name: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <TokenIcon src={logo} name={name} size="sm" />
      <span className="font-medium text-text-primary truncate">{name}</span>
    </div>
  );
}

export const MoversCard = memo(function MoversCard({ market }: { market: Market }) {
  const router = useRouter();
  const { format } = useNumberFormat();

  const spot = useTrendingSpotTokens(TOP_N, "volume", "desc");
  const perp = useTrendingPerpMarkets(TOP_N, "volume", "desc");

  const { data, isLoading, error } = market === "spot" ? spot : perp;

  const columns: Column<Row>[] = useMemo(() => {
    if (market === "spot") {
      return [
        {
          key: "name",
          header: "Token",
          accessor: (t) => <TokenCell logo={(t as SpotToken).logo} name={t.name} />,
        },
        {
          key: "price",
          header: "Price",
          type: "numeric",
          accessor: (t) => fmtPrice(t.price, format),
        },
        {
          key: "change24h",
          header: "24h",
          align: "right",
          accessor: (t) => <SignedPct value={t.change24h} />,
        },
        {
          key: "volume",
          header: "Volume",
          type: "numeric",
          accessor: (t) => compactUsd(t.volume),
        },
      ];
    }
    return [
      {
        key: "name",
        header: "Token",
        accessor: (t) => <TokenCell logo={(t as PerpMarketData).logo} name={t.name} />,
      },
      {
        key: "price",
        header: "Price",
        type: "numeric",
        accessor: (t) => fmtPrice(t.price, format),
      },
      {
        key: "change24h",
        header: "24h",
        align: "right",
        accessor: (t) => <SignedPct value={t.change24h} />,
      },
      {
        key: "volume",
        header: "Volume",
        type: "numeric",
        accessor: (t) => compactUsd(t.volume),
      },
    ];
  }, [market, format]);

  const handleRowClick = useCallback(
    (row: Row) => router.push(`/market/${market}/${encodeURIComponent(row.name)}`),
    [router, market],
  );

  const rows = (data ?? []).slice(0, TOP_N);

  return (
    <TypedDataTable<Row>
      title={
        <span className="inline-flex items-center gap-2">
          {market === "spot" ? "Trending Spot" : "Trending Perpetuals"}
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
            {rows.length} markets
          </span>
        </span>
      }
      icon={<TrendingUp size={14} className="text-brand" />}
      headerAction={
        <Link
          href={`/market/${market}`}
          className="flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors"
        >
          View all
          <ArrowUpRight size={12} />
        </Link>
      }
      data={rows}
      columns={columns}
      getRowKey={(r, i) => `${market}-${r.name}-${i}`}
      isLoading={isLoading}
      error={error}
      emptyMessage="No tokens available"
      emptyDescription=""
      density="compact"
      onRowClick={handleRowClick}
      rowMotion
    />
  );
});
