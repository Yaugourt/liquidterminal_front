"use client";

import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
} from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import type { SpotToken } from "@/services/market/spot/types";
import type { UseSpotDirectoryResult } from "@/services/market/spot/hooks/useSpotDirectory";
import type { UseSpotStablecoinsResult } from "@/services/market/stablecoins/types";

const tokenHref = (name: string) => `/market/spot/${encodeURIComponent(name)}`;

function MoverRows({ tokens }: { tokens: SpotToken[] }) {
  return (
    <>
      {tokens.map((t, i) => (
        <ModuleTableRow
          key={t.marketIndex}
          href={tokenHref(t.name)}
          // Rows past five only show in the xl rail, where they fill the
          // height of the directory table beside it.
          className={i >= 5 ? "hidden xl:table-row" : undefined}
          cells={[
            <ModuleAsset key="t" tone="neutral" assetName={t.name} kind="spot" name={t.name} />,
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

interface SpotLeaderboardsProps {
  directory: UseSpotDirectoryResult;
  stables: UseSpotStablecoinsResult;
}

/**
 * Leaderboards rail for /market/spot — top gainers / top losers (volume-floored
 * so dust tokens don't pollute the boards) and the per-stablecoin supply +
 * holder counts (a series the API exposes but no other card surfaces).
 */
export function SpotLeaderboards({ directory, stables }: SpotLeaderboardsProps) {
  const { gainers, losers } = directory;
  const moverCols = [
    { header: "Token" },
    { header: "Vol", width: 84 },
    { header: "24h", width: 88 },
  ];

  return (
    // Below xl: gainers and losers side by side, stablecoins on their own row
    // (four rows beside eight left a hole). At xl: a stacked rail next to the
    // directory table.
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
      <OverviewModule title="Top gainers · 24h" tag="min $10K vol" tagVariant="plain">
        <ModuleTable columns={moverCols}>
          <MoverRows tokens={gainers} />
        </ModuleTable>
        {gainers.length === 0 && !directory.isLoading && (
          <div className="px-4 py-3 text-[11px] text-text-tertiary">
            No gainer above the volume floor today.
          </div>
        )}
      </OverviewModule>

      <OverviewModule title="Top losers · 24h" tag="min $10K vol" tagVariant="plain">
        <ModuleTable columns={moverCols}>
          <MoverRows tokens={losers} />
        </ModuleTable>
        {losers.length === 0 && !directory.isLoading && (
          <div className="px-4 py-3 text-[11px] text-text-tertiary">
            No loser above the volume floor today.
          </div>
        )}
      </OverviewModule>

      <OverviewModule title="Stablecoins" tag="on-spot supply" tagVariant="plain" className="md:col-span-2 xl:col-span-1">
        <ModuleTable
          columns={[
            { header: "Coin" },
            { header: "Supply", width: 84 },
            { header: "Holders", width: 80 },
          ]}
        >
          {stables.stablecoins.map((s) => (
            <ModuleTableRow
              key={s.symbol}
              href={tokenHref(s.symbol)}
              cells={[
                <ModuleAsset
                  key="c"
                  tone="neutral"
                  assetName={s.symbol}
                  kind="spot"
                  name={s.symbol}
                />,
                <span key="s" className="mono text-text-secondary">
                  {compactUsd(s.supply)}
                </span>,
                <span key="h" className="mono text-text-tertiary">
                  {s.holders > 0 ? compactCount(s.holders) : "—"}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      </OverviewModule>
    </div>
  );
}
