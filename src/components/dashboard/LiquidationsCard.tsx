"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { Flame, ArrowUpRight } from "lucide-react";
import { TypedDataTable, type Column } from "@/components/common";
import { useRecentLiquidations } from "@/services/explorer/liquidation";
import type { Liquidation } from "@/services/explorer/liquidation";
import { compactUsd } from "@/lib/formatters/numberFormatting";

/**
 * LiquidationsCard — flux des liquidations récentes.
 *
 * Sorti de l'onglet « Vaults » fourre-tout. Ajoute la colonne Time (quand ?)
 * jusqu'ici absente — essentielle pour un flux d'activité live.
 */

const TOP_N = 8;

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  if (diff < 0) return "now";
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export const LiquidationsCard = memo(function LiquidationsCard() {
  const { liquidations, isLoading, error } = useRecentLiquidations({ limit: 100 });

  const rows = useMemo(() => liquidations.slice(0, TOP_N), [liquidations]);

  const columns: Column<Liquidation>[] = useMemo(
    () => [
      {
        key: "coin",
        header: "Coin",
        accessor: (l) => (
          <span className="font-medium text-text-primary">{l.coin}</span>
        ),
      },
      {
        key: "liq_dir",
        header: "Side",
        accessor: (l) => {
          const isLong = l.liq_dir === "Long";
          return (
            <span
              className={`mono text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                isLong
                  ? "bg-success/10 text-success"
                  : "bg-danger/10 text-danger"
              }`}
            >
              {l.liq_dir.toUpperCase()}
            </span>
          );
        },
      },
      {
        key: "notional_total",
        header: "Notional",
        type: "numeric",
        accessor: (l) => compactUsd(l.notional_total),
      },
      {
        key: "time_ms",
        header: "Time",
        type: "numeric",
        accessor: (l) => (
          <span className="text-text-tertiary">{timeAgo(l.time_ms)}</span>
        ),
      },
      {
        key: "liquidated_user",
        header: "User",
        type: "address",
        accessor: "liquidated_user",
      },
    ],
    [],
  );

  return (
    <TypedDataTable<Liquidation>
      title="Recent Liquidations"
      icon={<Flame size={14} className="text-brand" />}
      headerAction={
        <Link
          href="/explorer/liquidations"
          className="flex items-center gap-1 text-[11px] font-medium text-brand hover:text-brand-hover transition-colors"
        >
          View all
          <ArrowUpRight size={12} />
        </Link>
      }
      data={rows}
      columns={columns}
      getRowKey={(l) => l.tid}
      isLoading={isLoading}
      error={error}
      emptyMessage="No recent liquidations"
      emptyDescription=""
      density="compact"
      rowMotion
    />
  );
});
