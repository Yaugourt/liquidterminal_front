"use client";

import { memo, useMemo } from "react";
import { Gavel, Trophy, Crown } from "lucide-react";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
} from "@/components/common";
import {
  usePastAuctionsPerp,
  usePerpDexMarketData,
} from "@/services/market/perpDex/hooks";
import type { PastAuctionPerp } from "@/services/market/perpDex/types";
import { compactUsd, compactHype } from "@/lib/formatters/numberFormatting";
import { timeAgo } from "@/lib/formatters/dateFormatting";

/**
 * Companion cards for the HIP-3 auction row, sourced from the same hook the
 * `/market/perpdex` page uses (`usePastAuctionsPerp`). This guarantees the
 * deployer names (`dex` / `dexFullName`) match what is shown on the rest of
 * the app — no separate aggregation, no truncated address as fallback.
 *
 *   - `Hip3PastAuctionsCard`  — 5 most recent HIP-3 ticker deploys.
 *   - `Hip3TopDeployersCard`  — top 5 deployers (= dexs) by total HYPE bid.
 */

const PAST_ROWS = 5;
const TOP_DEPLOYERS = 5;

// ─────────────────────────────────────────────────────────────────────────────
// Hip3PastAuctionsCard — last 5 ticker deploys
// ─────────────────────────────────────────────────────────────────────────────

export const Hip3PastAuctionsCard = memo(function Hip3PastAuctionsCard() {
  const { auctions, isLoading } = usePastAuctionsPerp();

  const rows = useMemo<PastAuctionPerp[]>(() => {
    return [...auctions]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, PAST_ROWS);
  }, [auctions]);

  return (
    <OverviewModule
      title="Past HIP-3 Auctions"
      icon={<Gavel size={13} className="text-brand" />}
      tag="HYPE"
      viewAllLabel="View all"
      href="/market/perp/auction"
    >
      <ModuleTable
        columns={[
          { header: "Ticker" },
          { header: "Amount" },
          { header: "Age" },
        ]}
      >
        {isLoading && rows.length === 0 && (
          <tr>
            <td colSpan={3} className="px-4 py-2.5 text-[12px] text-text-tertiary">
              …
            </td>
          </tr>
        )}
        {rows.map((r) => (
          <ModuleTableRow
            key={r.hash}
            cells={[
              <ModuleAsset
                key="tok"
                assetName={`xyz:${r.symbol}`}
                name={r.coin}
              />,
              <span key="amt" className="mono text-gold font-semibold">
                {compactHype(r.maxGas)} HYPE
              </span>,
              <span key="age" className="mono text-text-tertiary">
                {timeAgo(r.time)}
              </span>,
            ]}
          />
        ))}
      </ModuleTable>
    </OverviewModule>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Hip3TopDeployersCard — top 5 perp DEXs by 24h volume.
// Mirrors the `/market/perpdex` page (Vol + OI columns), since each dex is a
// deployer entity in the HIP-3 ecosystem.
// ─────────────────────────────────────────────────────────────────────────────

export const Hip3TopDeployersCard = memo(function Hip3TopDeployersCard() {
  const { dexs, isLoading } = usePerpDexMarketData();

  const top = useMemo(
    () =>
      [...dexs]
        .sort((a, b) => b.totalVolume24h - a.totalVolume24h)
        .slice(0, TOP_DEPLOYERS),
    [dexs],
  );

  return (
    <OverviewModule
      title="Top Deployers"
      icon={<Trophy size={13} className="text-brand" />}
      tag="by 24h vol"
      viewAllLabel="View all"
      href="/market/perpdex"
    >
      <ModuleTable
        columns={[
          { header: "Deployer" },
          { header: "Markets" },
          { header: "Vol" },
          { header: "OI" },
        ]}
      >
        {isLoading && top.length === 0 && (
          <tr>
            <td colSpan={4} className="px-4 py-2.5 text-[12px] text-text-tertiary">
              …
            </td>
          </tr>
        )}
        {top.map((dex, i) => (
          <ModuleTableRow
            key={dex.name}
            href={`/market/perpdex/${dex.name}`}
            cells={[
              <ModuleAsset
                key="dep"
                logo={i === 0 ? <Crown size={12} className="text-gold" /> : i + 1}
                name={dex.fullName}
              />,
              <span key="mkts" className="mono text-text-primary">
                {dex.activeAssets > 0 ? dex.activeAssets : "—"}
              </span>,
              <span key="vol" className="mono text-text-primary">
                {dex.totalVolume24h > 0 ? compactUsd(dex.totalVolume24h) : "—"}
              </span>,
              <span key="oi" className="mono text-text-primary">
                {dex.totalOpenInterest > 0 ? compactUsd(dex.totalOpenInterest) : "—"}
              </span>,
            ]}
          />
        ))}
      </ModuleTable>
    </OverviewModule>
  );
});
