"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  CardHead,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  Skeleton,
  SourceBadge,
  sourceStatus,
} from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { useTraderPnlByCoin, type CoinPnl } from "@/services/market/trader-pnl";

const signedUsd = (v: number) => `${v >= 0 ? "+" : "-"}${compactUsd(Math.abs(v))}`;

function PnlList({ title, rows }: { title: string; rows: CoinPnl[] }) {
  return (
    <div>
      <div className="px-3.5 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
        {title}
      </div>
      <ModuleTable
        density="compact"
        columns={[
          { header: "Market", align: "left" },
          { header: "Net trader PnL", align: "right" },
        ]}
      >
        {rows.map((c) => (
          <ModuleTableRow
            key={c.coin}
            cells={[
              <ModuleAsset key="c" assetName={c.coin} kind="auto" name={c.coin} />,
              <span
                key="p"
                className={`mono font-medium ${c.pnl >= 0 ? "text-success" : "text-danger"}`}
              >
                {signedUsd(c.pnl)}
              </span>,
            ]}
          />
        ))}
      </ModuleTable>
    </div>
  );
}

/**
 * Net trader realized PnL by market over 10 days — the markets where traders
 * collectively made the most money, and the ones that bled them most. Only-here:
 * dashboards show fee/volume flows, not aggregate trader realized PnL per coin.
 */
export function TraderPnlCard() {
  const { coins, isLoading, error } = useTraderPnlByCoin();

  const { gainers, losers } = useMemo(() => {
    const g = coins.filter((c) => c.pnl > 0).slice(0, 7);
    const l = coins.filter((c) => c.pnl < 0).slice(-7).reverse();
    return { gainers: g, losers: l };
  }, [coins]);

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHead
        title="Trader PnL by market"
        tag="net realized · 10d"
        actions={<SourceBadge source="hypedexer" status={sourceStatus(error, isLoading)} />}
      />

      {isLoading && coins.length === 0 ? (
        <div className="p-3">
          <Skeleton className="h-40 rounded" />
        </div>
      ) : error || coins.length === 0 ? (
        <div className="px-3.5 py-6 text-center text-xs text-text-tertiary">
          No trader PnL data available.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x divide-border-subtle">
          <PnlList title="Traders profited" rows={gainers} />
          <PnlList title="Traders bled" rows={losers} />
        </div>
      )}
    </Card>
  );
}
