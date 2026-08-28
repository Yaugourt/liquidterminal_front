"use client";

import { useMemo } from "react";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
} from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import { usePerpMarkets } from "@/services/market/perp/hooks/usePerpMarket";
import type { PerpMarketData } from "@/services/market/perp/types";

const tokenHref = (name: string) => `/market/perp/${encodeURIComponent(name)}`;
const VOLUME_FLOOR = 10_000;

function MoverRows({ tokens }: { tokens: PerpMarketData[] }) {
  return (
    <>
      {tokens.map((t) => (
        <ModuleTableRow
          key={t.name}
          href={tokenHref(t.name)}
          cells={[
            <ModuleAsset key="t" tone="neutral" assetName={t.name} kind="auto" name={t.name} />,
            <span key="v" className="mono text-text-secondary">
              {compactUsd(t.volume)}
            </span>,
            <span
              key="c"
              className={`mono font-medium ${t.change24h >= 0 ? "text-success" : "text-danger"}`}
            >
              {`${t.change24h >= 0 ? "+" : ""}${t.change24h.toFixed(1)}%`}
            </span>,
          ]}
        />
      ))}
    </>
  );
}

/**
 * Top gainers / losers rail for /market/perp — mirrors the spot leaderboards,
 * volume-floored so thin markets don't dominate the boards. Derived client-side
 * from the shared perp directory fetch (no extra endpoint).
 */
export function PerpLeaderboards() {
  const { data, isLoading } = usePerpMarkets({
    limit: 1000,
    defaultParams: { sortBy: "volume", sortOrder: "desc" },
  });

  const { gainers, losers } = useMemo(() => {
    const liquid = data.filter((t) => t.volume >= VOLUME_FLOOR);
    return {
      gainers: [...liquid]
        .filter((t) => t.change24h > 0)
        .sort((a, b) => b.change24h - a.change24h)
        .slice(0, 5),
      losers: [...liquid]
        .filter((t) => t.change24h < 0)
        .sort((a, b) => a.change24h - b.change24h)
        .slice(0, 5),
    };
  }, [data]);

  const moverCols = [
    { header: "Market" },
    { header: "Vol", width: 84 },
    { header: "24h", width: 88 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <OverviewModule title="Top gainers · 24h" tag="min $10K vol" tagVariant="plain">
        <ModuleTable columns={moverCols}>
          <MoverRows tokens={gainers} />
        </ModuleTable>
        {gainers.length === 0 && !isLoading && (
          <div className="px-4 py-3 text-[11px] text-text-tertiary">
            No gainer above the volume floor today.
          </div>
        )}
      </OverviewModule>

      <OverviewModule title="Top losers · 24h" tag="min $10K vol" tagVariant="plain">
        <ModuleTable columns={moverCols}>
          <MoverRows tokens={losers} />
        </ModuleTable>
        {losers.length === 0 && !isLoading && (
          <div className="px-4 py-3 text-[11px] text-text-tertiary">
            No loser above the volume floor today.
          </div>
        )}
      </OverviewModule>
    </div>
  );
}
