"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { LoadingState } from "@/components/ui/loading-state";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { BuilderCoinBreakdownRow } from "@/services/indexer/builders/types";
import { formatNumber } from "@/lib/formatters/numberFormatting";
import { useNumberFormat } from "@/store/number-format.store";
import { TokenAvatar } from "@/components/common";

interface BuilderCoinBreakdownProps {
  coins: BuilderCoinBreakdownRow[];
  isLoading: boolean;
  label?: string;
}

type SortKey = "volume" | "fees" | "users";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "volume", label: "Volume" },
  { key: "fees", label: "Fees" },
  { key: "users", label: "Users" },
];

export function BuilderCoinBreakdown({ coins, isLoading, label }: BuilderCoinBreakdownProps) {
  const { format } = useNumberFormat();
  const [sortKey, setSortKey] = useState<SortKey>("volume");

  const sorted = useMemo(() => {
    const pick = (c: BuilderCoinBreakdownRow) => {
      if (sortKey === "volume") return (c.totalVolume as number) ?? 0;
      if (sortKey === "fees") return (c.totalBuilderFees as number) ?? 0;
      return (c.uniqueUsers as number) ?? 0;
    };
    return [...coins]
      .sort((a, b) => pick(b) - pick(a))
      .slice(0, 10);
  }, [coins, sortKey]);

  const maxValue = useMemo(() => {
    const pick = (c: BuilderCoinBreakdownRow) => {
      if (sortKey === "volume") return (c.totalVolume as number) ?? 0;
      if (sortKey === "fees") return (c.totalBuilderFees as number) ?? 0;
      return (c.uniqueUsers as number) ?? 0;
    };
    return Math.max(...sorted.map(pick), 1);
  }, [sorted, sortKey]);

  const formatByKey = (v: number) => {
    if (sortKey === "users") return formatNumber(v, format, { maximumFractionDigits: 0 });
    return formatNumber(v, format, { maximumFractionDigits: sortKey === "fees" ? 2 : 0, currency: "$", showCurrency: true });
  };

  return (
    <Card className="p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-text-primary font-semibold text-sm">{label ?? "Top Coins"}</h2>
        <div className="flex items-center rounded-lg border border-border-subtle bg-base p-0.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={`relative rounded-md px-2.5 py-0.5 text-[10px] font-semibold transition-colors ${
                sortKey === opt.key
                  ? "bg-brand/15 text-brand"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && sorted.length === 0 ? (
        <LoadingState message="Loading coins…" size="sm" withCard={false} />
      ) : sorted.length === 0 ? (
        <EmptyState
          title="No data"
          description="No coin data for this window."
          withCard={false}
          className="h-[120px]"
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((coin, i) => {
            const pickVal =
              sortKey === "volume"
                ? (coin.totalVolume as number) ?? 0
                : sortKey === "fees"
                  ? (coin.totalBuilderFees as number) ?? 0
                  : (coin.uniqueUsers as number) ?? 0;
            const fees = (coin.totalBuilderFees as number) ?? 0;
            const vol = (coin.totalVolume as number) ?? 0;
            const users = (coin.uniqueUsers as number) ?? 0;
            const pct = (pickVal / maxValue) * 100;
            return (
              <motion.div
                key={(coin.coin as string) ?? i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-text-tertiary text-xs w-4 tabular-nums shrink-0">{i + 1}</span>
                    {coin.coin && <TokenAvatar assetName={coin.coin as string} size="sm" />}
                    <span className="text-text-primary text-sm font-medium truncate">{(coin.coin as string) ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-right shrink-0">
                    <div className="flex flex-col items-end">
                      <p className="text-text-primary text-sm tabular-nums">
                        {formatByKey(pickVal)}
                      </p>
                      <p className="text-text-tertiary text-[10px] tabular-nums">
                        {sortKey !== "volume" && (
                          <span>Vol {formatNumber(vol, format, { maximumFractionDigits: 0, currency: "$", showCurrency: true })}</span>
                        )}
                        {sortKey === "volume" && fees > 0 && (
                          <span className="text-gold">
                            {formatNumber(fees, format, { maximumFractionDigits: 2, currency: "$", showCurrency: true })} fees
                          </span>
                        )}
                        {sortKey === "users" && (
                          <span> · {users} users</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-full h-1 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: i * 0.04 + 0.1, duration: 0.4 }}
                    className="h-full bg-brand/50 rounded-full"
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
