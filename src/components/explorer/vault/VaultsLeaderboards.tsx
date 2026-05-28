"use client";

import { useMemo } from "react";
import { TrendingUp, Users, ArrowDownToLine } from "lucide-react";
import { OverviewModule, ModuleRow } from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import { useVaultsLeaderboards } from "@/services/explorer/vault/hooks/useVaultsLeaderboards";
import type { UseVaultsDirectoryResult } from "@/services/explorer/vault/hooks/useVaultsDirectory";

const HLP_ADDRESS = "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303";

interface VaultsLeaderboardsProps {
  directory: UseVaultsDirectoryResult;
}

const initials = (name: string) => name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
const vaultHref = (addr: string) => `/explorer/vaults/${encodeURIComponent(addr)}`;

/**
 * Right-rail leaderboards for /explorer/vaults (mockup B side modules).
 * Three stacked cards of dense ModuleRow lists: Top APR, Followers gained,
 * Largest outflows. Lives in a 280px sticky column next to the directory.
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
    <div className="space-y-4">
      <OverviewModule
        title="Top APR · 24h"
        icon={<TrendingUp size={13} className="text-brand" />}
        tag={topApr.length > 0 ? String(topApr.length) : undefined}
      >
        {topApr.map((v, i) => (
          <ModuleRow
            key={v.summary.vaultAddress}
            rank={i + 1}
            logo={initials(v.summary.name)}
            name={v.summary.name}
            sub={`${compactUsd(parseFloat(v.summary.tvl))} TVL`}
            href={vaultHref(v.summary.vaultAddress)}
            stats={[
              {
                value: `${v.apr >= 0 ? "+" : ""}${v.apr.toFixed(0)}%`,
                valueClassName: v.apr >= 0 ? "text-success" : "text-danger",
              },
            ]}
          />
        ))}
      </OverviewModule>

      <OverviewModule
        title="Followers gained · 24h"
        icon={<Users size={13} className="text-brand" />}
        tag={followersRows.length > 0 ? String(followersRows.length) : undefined}
      >
        {followersRows.map((v, i) => (
          <ModuleRow
            key={v.vaultAddress}
            rank={i + 1}
            logo={initials(v.name)}
            name={v.name}
            sub={`${compactCount(v.total)} total`}
            href={vaultHref(v.vaultAddress)}
            stats={[{ value: `+${compactCount(v.delta)}`, valueClassName: "text-success" }]}
          />
        ))}
      </OverviewModule>

      <OverviewModule
        title="Largest outflows · 24h"
        icon={<ArrowDownToLine size={13} className="text-brand" />}
        tag={outflowsRows.length > 0 ? String(outflowsRows.length) : undefined}
      >
        {outflowsRows.map((v, i) => (
          <ModuleRow
            key={v.vaultAddress}
            rank={i + 1}
            logo={initials(v.name)}
            name={v.name}
            sub={compactUsd(v.amountUsd)}
            href={vaultHref(v.vaultAddress)}
            stats={[
              {
                value: `${(v.percentOfTvl * 100).toFixed(1)}%`,
                valueClassName: "text-danger",
              },
            ]}
          />
        ))}
      </OverviewModule>
    </div>
  );
}
