"use client";

import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
} from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { PerpMarketData } from "@/services/market/perp/types";
import type { UsePerpDirectoryResult } from "@/services/market/perp/hooks/usePerpDirectory";

const marketHref = (name: string) => `/market/perp/${encodeURIComponent(name)}`;

function MoverRows({ markets }: { markets: PerpMarketData[] }) {
  return (
    <>
      {markets.map((m) => (
        <ModuleTableRow
          key={m.index}
          href={marketHref(m.name)}
          cells={[
            <ModuleAsset key="t" tone="neutral" assetName={m.name} kind="auto" name={m.name} />,
            <span key="v" className="mono text-text-secondary">
              {compactUsd(m.volume)}
            </span>,
            <span
              key="c"
              className={`mono font-medium ${m.change24h >= 0 ? "text-success" : "text-danger"}`}
            >
              {`${m.change24h >= 0 ? "+" : ""}${m.change24h.toFixed(1)}%`}
            </span>,
          ]}
        />
      ))}
    </>
  );
}

interface PerpLeaderboardsProps {
  directory: UsePerpDirectoryResult;
}

/**
 * Leaderboards rail for /market/perp — top gainers / losers (volume-floored so
 * thin markets don't pollute the boards) and the markets carrying the most open
 * interest (with their current hourly funding).
 */
export function PerpLeaderboards({ directory }: PerpLeaderboardsProps) {
  const { gainers, losers, oiConcentration } = directory;
  const topOi = [oiConcentration.top, ...oiConcentration.next].filter(
    (m): m is PerpMarketData => m !== null
  );

  const moverCols = [{ header: "Market" }, { header: "Vol", width: 84 }, { header: "24h", width: 88 }];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-4">
      <OverviewModule title="Top gainers · 24h" tag="min $1M vol" tagVariant="plain">
        <ModuleTable columns={moverCols}>
          <MoverRows markets={gainers} />
        </ModuleTable>
        {gainers.length === 0 && !directory.isLoading && (
          <div className="px-4 py-3 text-[11px] text-text-tertiary">
            No gainer above the volume floor today.
          </div>
        )}
      </OverviewModule>

      <OverviewModule title="Top losers · 24h" tag="min $1M vol" tagVariant="plain">
        <ModuleTable columns={moverCols}>
          <MoverRows markets={losers} />
        </ModuleTable>
        {losers.length === 0 && !directory.isLoading && (
          <div className="px-4 py-3 text-[11px] text-text-tertiary">
            No loser above the volume floor today.
          </div>
        )}
      </OverviewModule>

      <OverviewModule title="Top open interest" tag="live · 1h funding" tagVariant="plain">
        <ModuleTable
          columns={[{ header: "Market" }, { header: "OI", width: 84 }, { header: "Funding", width: 80 }]}
        >
          {topOi.map((m) => (
            <ModuleTableRow
              key={m.index}
              href={marketHref(m.name)}
              cells={[
                <ModuleAsset key="t" tone="neutral" assetName={m.name} kind="auto" name={m.name} />,
                <span key="o" className="mono text-text-secondary">
                  {compactUsd(m.openInterest)}
                </span>,
                <span
                  key="f"
                  className={`mono ${m.funding >= 0 ? "text-success" : "text-danger"}`}
                >
                  {m.funding >= 0 ? "+" : ""}
                  {(m.funding * 100).toFixed(4)}%
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      </OverviewModule>
    </div>
  );
}
