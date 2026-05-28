"use client";

import { useMemo } from "react";
import { TrendingUp, Users, ArrowDownToLine } from "lucide-react";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
} from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { useVaultsLeaderboards } from "@/services/explorer/vault/hooks/useVaultsLeaderboards";
import type { UseVaultsDirectoryResult } from "@/services/explorer/vault/hooks/useVaultsDirectory";

const HLP_ADDRESS = "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303";

interface VaultsLeaderboardsProps {
  directory: UseVaultsDirectoryResult;
}

/**
 * Three leaderboard cards above the directory table.
 *
 * These cards are ~240px wide at `lg` (three side by side, minus the sidebar),
 * so the metric columns get explicit widths — that flips ModuleTable into
 * `table-fixed`, which makes the (width-less) Vault column the flexible one and
 * lets its name truncate instead of widening the table past the card and
 * clipping (caught by `pnpm run visual-check /explorer/vaults`). `compact`
 * density keeps the numbers readable in the remaining space.
 */
export function VaultsLeaderboards({ directory }: VaultsLeaderboardsProps) {
  const { rows, totalTvl } = directory;

  const topApr = useMemo(
    () =>
      rows
        .filter(
          (r) =>
            !r.summary.isClosed &&
            r.summary.vaultAddress.toLowerCase() !== HLP_ADDRESS &&
            Number.isFinite(r.apr)
        )
        .sort((a, b) => b.apr - a.apr)
        .slice(0, 5),
    [rows]
  );

  const { followersGained, outflows } = useVaultsLeaderboards({
    window: "24h",
    followersLimit: 6,
    outflowsLimit: 4,
  });

  const followersRows = useMemo(
    () => followersGained.filter((f) => f.vaultAddress.toLowerCase() !== HLP_ADDRESS).slice(0, 5),
    [followersGained]
  );

  const outflowsRows = useMemo(
    () => outflows.filter((o) => o.vaultAddress.toLowerCase() !== HLP_ADDRESS).slice(0, 3),
    [outflows]
  );

  const totalFollowersDelta = useMemo(
    () => followersRows.reduce((sum, r) => sum + r.delta, 0),
    [followersRows]
  );
  const totalOutflowsAmount = useMemo(
    () => outflowsRows.reduce((sum, r) => sum + r.amountUsd, 0),
    [outflowsRows]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <OverviewModule
        title="Top APR · current"
        icon={<TrendingUp size={13} className="text-brand" />}
        tag={`${compactUsd(totalTvl)} TVL`}
      >
        <ModuleTable
          density="compact"
          columns={[
            { header: "Vault" },
            { header: "APR", width: 88 },
            { header: "TVL", width: 84 },
          ]}
        >
          {topApr.map((v) => (
            <ModuleTableRow
              key={v.summary.vaultAddress}
              href={`/explorer/vaults/${encodeURIComponent(v.summary.vaultAddress)}`}
              cells={[
                <ModuleAsset
                  key="vault"
                  logo={v.summary.name.slice(0, 2).toUpperCase()}
                  name={v.summary.name}
                />,
                <span
                  key="apr"
                  className={`mono font-semibold ${v.apr >= 0 ? "text-success" : "text-danger"}`}
                >
                  {`${v.apr >= 0 ? "+" : ""}${v.apr.toFixed(1)}%`}
                </span>,
                <span key="tvl" className="mono text-text-primary">
                  {compactUsd(parseFloat(v.summary.tvl))}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      </OverviewModule>

      <OverviewModule
        title="Followers gained · 24h"
        icon={<Users size={13} className="text-brand" />}
        tag={totalFollowersDelta > 0 ? `+${compactCount(totalFollowersDelta)} new` : undefined}
      >
        <ModuleTable
          density="compact"
          columns={[
            { header: "Vault" },
            { header: "Δ 24h", width: 72 },
            { header: "TVL", width: 84 },
          ]}
        >
          {followersRows.map((v) => (
            <ModuleTableRow
              key={v.vaultAddress}
              href={`/explorer/vaults/${encodeURIComponent(v.vaultAddress)}`}
              cells={[
                <ModuleAsset
                  key="vault"
                  logo={v.name.slice(0, 2).toUpperCase()}
                  name={v.name}
                />,
                <span key="delta" className="mono font-semibold text-success">
                  {`+${compactCount(v.delta)}`}
                </span>,
                <span key="tvl" className="mono text-text-primary">
                  {compactUsd(v.tvl)}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      </OverviewModule>

      <OverviewModule
        title="Largest outflows · 24h"
        icon={<ArrowDownToLine size={13} className="text-brand" />}
        tag={totalOutflowsAmount < 0 ? `${compactUsd(totalOutflowsAmount)} out` : undefined}
      >
        <ModuleTable
          density="compact"
          columns={[
            { header: "Vault" },
            { header: "Out", width: 88 },
            { header: "% TVL", width: 76 },
          ]}
        >
          {outflowsRows.map((v) => (
            <ModuleTableRow
              key={v.vaultAddress}
              href={`/explorer/vaults/${encodeURIComponent(v.vaultAddress)}`}
              cells={[
                <ModuleAsset
                  key="vault"
                  logo={v.name.slice(0, 2).toUpperCase()}
                  name={v.name}
                />,
                <span key="out" className="mono font-semibold text-danger">
                  {compactUsd(v.amountUsd)}
                </span>,
                <span key="pct" className="mono text-danger">
                  {`${(v.percentOfTvl * 100).toFixed(1)}%`}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      </OverviewModule>
    </div>
  );
}
