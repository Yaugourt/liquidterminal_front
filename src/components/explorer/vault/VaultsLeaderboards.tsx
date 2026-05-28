"use client";

import { useMemo } from "react";
import { TrendingUp, Users, ArrowDownToLine } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  OverviewModule,
  ModuleTable,
  ModuleTableRow,
  ModuleAsset,
} from "@/components/common";
import { compactUsd } from "@/lib/formatters/numberFormatting";
import type { UseVaultsDirectoryResult } from "@/services/explorer/vault/hooks/useVaultsDirectory";

const HLP_ADDRESS = "0xdfc24b077bc1425ad1dea75bcb6f8158e10df303";

interface VaultsLeaderboardsProps {
  directory: UseVaultsDirectoryResult;
}

/**
 * Three side-by-side cards under the directory table:
 * - Top APR · current — live data from useVaultsDirectory.
 * - Followers gained · 24h — placeholder (no /vault/follower-delta endpoint).
 * - Largest outflows · 24h — placeholder (no /vault/flow-aggregate endpoint).
 *
 * Placeholders show "Coming soon — needs back endpoint" rather than fake data.
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

  return (
    <div className="flex flex-col gap-3">
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

      <PlaceholderModule
        title="Followers gained · 24h"
        icon={<Users size={13} className="text-text-tertiary" />}
      />

      <PlaceholderModule
        title="Largest outflows · 24h"
        icon={<ArrowDownToLine size={13} className="text-text-tertiary" />}
      />
    </div>
  );
}

interface PlaceholderModuleProps {
  title: string;
  icon: React.ReactNode;
}

function PlaceholderModule({ title, icon }: PlaceholderModuleProps) {
  return (
    <Card className="flex flex-col opacity-60">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-border-subtle">
        <span className="w-6 h-6 rounded-md bg-surface-2 grid place-items-center shrink-0">
          {icon}
        </span>
        <h3 className="text-[13px] font-semibold text-text-secondary truncate">{title}</h3>
        <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-2 text-text-tertiary border border-border-subtle">
          Soon
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 py-10 text-center">
        <p className="text-xs text-text-tertiary max-w-[200px] leading-relaxed">
          Coming soon — needs back endpoint exposing 24 h deltas.
        </p>
      </div>
    </Card>
  );
}
