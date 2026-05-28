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
 * Three side-by-side cards under the directory table:
 * - Top APR · current — derived client-side from the directory rows.
 * - Followers gained · 24h — back-aggregated via /indexer/vaults/leaderboards/followers-gained.
 * - Largest outflows · 24h — back-aggregated via /indexer/vaults/leaderboards/outflows.
 */
export function VaultsLeaderboards({ directory }: VaultsLeaderboardsProps) {
  const { rows } = directory;

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
      <OverviewModule
        title="Top APR · current"
        icon={<TrendingUp size={13} className="text-brand" />}
        tag={topApr.length}
        href="/explorer/vaults"
        viewAllLabel="All vaults"
      >
        <ModuleTable
          density="compact"
          columns={[
            { header: "#", width: 28, align: "left" },
            { header: "Vault", align: "left" },
            { header: "TVL", align: "right", width: 90 },
            { header: "APR", align: "right", width: 80 },
          ]}
        >
          {topApr.map((v, i) => (
            <ModuleTableRow
              key={v.summary.vaultAddress}
              href={`/explorer/vaults/${v.summary.vaultAddress}`}
              cells={[
                <span key="r" className="mono text-text-tertiary">
                  {i + 1}
                </span>,
                <ModuleAsset
                  key="a"
                  name={
                    <span className="truncate block max-w-[180px]">
                      {v.summary.name}
                    </span>
                  }
                  sub={
                    <span className="mono text-text-tertiary text-[10px]">
                      {v.summary.vaultAddress.slice(0, 6)}…{v.summary.vaultAddress.slice(-4)}
                    </span>
                  }
                />,
                <span key="t" className="mono text-text-secondary">
                  {compactUsd(parseFloat(v.summary.tvl))}
                </span>,
                <span
                  key="apr"
                  className={`mono font-semibold ${v.apr >= 0 ? "text-success" : "text-danger"}`}
                >
                  {v.apr >= 0 ? "+" : ""}
                  {v.apr.toFixed(2)}%
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      </OverviewModule>

      <OverviewModule
        title="Followers gained · 24h"
        icon={<Users size={13} className="text-brand" />}
        tag={followersRows.length}
        href="/explorer/vaults"
        viewAllLabel="All vaults"
      >
        <ModuleTable
          density="compact"
          columns={[
            { header: "#", width: 28, align: "left" },
            { header: "Vault", align: "left" },
            { header: "TVL", align: "right", width: 90 },
            { header: "Δ 24h", align: "right", width: 70 },
          ]}
        >
          {followersRows.map((v, i) => (
            <ModuleTableRow
              key={v.vaultAddress}
              href={`/explorer/vaults/${v.vaultAddress}`}
              cells={[
                <span key="r" className="mono text-text-tertiary">
                  {i + 1}
                </span>,
                <ModuleAsset
                  key="a"
                  name={
                    <span className="truncate block max-w-[180px]">{v.name}</span>
                  }
                  sub={
                    <span className="mono text-text-tertiary text-[10px]">
                      {v.vaultAddress.slice(0, 6)}…{v.vaultAddress.slice(-4)}
                    </span>
                  }
                />,
                <span key="t" className="mono text-text-secondary">
                  {compactUsd(v.tvl)}
                </span>,
                <span key="d" className="mono font-semibold text-success">
                  +{compactCount(v.delta)}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      </OverviewModule>

      <OverviewModule
        title="Largest outflows · 24h"
        icon={<ArrowDownToLine size={13} className="text-brand" />}
        tag={outflowsRows.length}
        href="/explorer/vaults"
        viewAllLabel="All vaults"
      >
        <ModuleTable
          density="compact"
          columns={[
            { header: "#", width: 28, align: "left" },
            { header: "Vault", align: "left" },
            { header: "Out", align: "right", width: 90 },
            { header: "% TVL", align: "right", width: 70 },
          ]}
        >
          {outflowsRows.map((v, i) => (
            <ModuleTableRow
              key={v.vaultAddress}
              href={`/explorer/vaults/${v.vaultAddress}`}
              cells={[
                <span key="r" className="mono text-text-tertiary">
                  {i + 1}
                </span>,
                <ModuleAsset
                  key="a"
                  name={
                    <span className="truncate block max-w-[180px]">{v.name}</span>
                  }
                  sub={
                    <span className="mono text-text-tertiary text-[10px]">
                      {v.vaultAddress.slice(0, 6)}…{v.vaultAddress.slice(-4)}
                    </span>
                  }
                />,
                <span key="o" className="mono font-semibold text-danger">
                  {compactUsd(v.amountUsd)}
                </span>,
                <span key="p" className="mono text-danger">
                  {(v.percentOfTvl * 100).toFixed(1)}%
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      </OverviewModule>
    </div>
  );
}
