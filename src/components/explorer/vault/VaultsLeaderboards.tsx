"use client";

import { useMemo } from "react";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
  Skeleton,
} from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { useVaultsLeaderboards } from "@/services/explorer/vault/hooks/useVaultsLeaderboards";
import type { UseVaultsDirectoryResult } from "@/services/explorer/vault/hooks/useVaultsDirectory";

const HLP_ADDRESS = "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303";
const APR_TVL_FLOOR = 1_000_000; // keep "Top APR" credible — micro-vaults show absurd APRs

interface VaultsLeaderboardsProps {
  directory: UseVaultsDirectoryResult;
}

const initials = (name: string) =>
  name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
const vaultHref = (addr: string) => `/explorer/vaults/${encodeURIComponent(addr)}`;

/**
 * Leaderboards rail for /explorer/vaults: a vertical stack of OverviewModule +
 * ModuleTable cards sitting to the right of the directory table — Top APR
 * (current), Followers gained (24h), Largest outflows (24h). Minimal treatment:
 * neutral avatars, plain tags, no card icon.
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
            Number.isFinite(r.apr) &&
            parseFloat(r.summary.tvl) >= APR_TVL_FLOOR
        )
        .sort((a, b) => b.apr - a.apr)
        .slice(0, 5),
    [rows]
  );

  const { followersGained, outflows, isLoading: leaderboardsLoading } = useVaultsLeaderboards({
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
    // Full-width 3-col row below xl; a stacked vertical rail at xl (next to the
    // directory table). Keeps cards roomy at 1024 (no clip) and tucks them to
    // the right on wide screens.
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-4">
      <OverviewModule title="Top APR · current" tag="min $1M" tagVariant="plain">
        <ModuleTable
          columns={[{ header: "Vault" }, { header: "TVL", width: 84 }, { header: "APR", width: 72 }]}
        >
          {topApr.map((v) => (
            <ModuleTableRow
              key={v.summary.vaultAddress}
              href={vaultHref(v.summary.vaultAddress)}
              cells={[
                <ModuleAsset
                  key="v"
                  tone="neutral"
                  logo={initials(v.summary.name)}
                  name={v.summary.name}
                />,
                <span key="t" className="mono text-text-secondary">
                  {compactUsd(parseFloat(v.summary.tvl))}
                </span>,
                <span
                  key="a"
                  className={`mono font-medium ${v.apr >= 0 ? "text-success" : "text-danger"}`}
                >
                  {`${v.apr >= 0 ? "+" : ""}${v.apr.toFixed(0)}%`}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
      </OverviewModule>

      <OverviewModule title="Followers gained · 24h" tag="sampled 50" tagVariant="plain">
        {leaderboardsLoading ? (
          <ModuleSkeleton />
        ) : followersRows.length === 0 ? (
          <ModuleEmpty>No follower data for this window.</ModuleEmpty>
        ) : (
        <ModuleTable
          columns={[{ header: "Vault" }, { header: "Total", width: 72 }, { header: "Δ 24h", width: 64 }]}
        >
          {followersRows.map((v) => (
            <ModuleTableRow
              key={v.vaultAddress}
              href={vaultHref(v.vaultAddress)}
              cells={[
                <ModuleAsset key="v" tone="neutral" logo={initials(v.name)} name={v.name} />,
                <span key="t" className="mono text-text-secondary">
                  {compactCount(v.total)}
                </span>,
                <span key="d" className="mono font-medium text-success">
                  {`+${compactCount(v.delta)}`}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
        )}
      </OverviewModule>

      <OverviewModule title="Largest outflows · 24h" tag="24h" tagVariant="plain">
        {leaderboardsLoading ? (
          <ModuleSkeleton />
        ) : outflowsRows.length === 0 ? (
          <ModuleEmpty>No outflow data for this window.</ModuleEmpty>
        ) : (
        <ModuleTable
          columns={[{ header: "Vault" }, { header: "% TVL", width: 64 }, { header: "Out", width: 84 }]}
        >
          {outflowsRows.map((v) => (
            <ModuleTableRow
              key={v.vaultAddress}
              href={vaultHref(v.vaultAddress)}
              cells={[
                <ModuleAsset key="v" tone="neutral" logo={initials(v.name)} name={v.name} />,
                <span key="p" className="mono text-danger">
                  {`${(v.percentOfTvl * 100).toFixed(1)}%`}
                </span>,
                <span key="o" className="mono font-medium text-danger">
                  {compactUsd(v.amountUsd)}
                </span>,
              ]}
            />
          ))}
        </ModuleTable>
        )}
      </OverviewModule>
    </div>
  );
}

/** Explicit empty state for a leaderboard module: the /indexer leaderboards
 * legitimately return no rows for quiet windows, and must not render a bare
 * header-only table. */
function ModuleEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3.5 py-5 text-xs text-text-tertiary text-center">{children}</p>
  );
}

function ModuleSkeleton() {
  return (
    <div className="px-3.5 py-3 space-y-2">
      <Skeleton className="h-6 rounded" />
      <Skeleton className="h-6 rounded" />
      <Skeleton className="h-6 rounded" />
    </div>
  );
}
