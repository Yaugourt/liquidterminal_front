"use client";

import Link from "next/link";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";

function formatTVL(tvlStr: string | number | undefined): string {
  const tvl = typeof tvlStr === "string" ? parseFloat(tvlStr) : (tvlStr ?? 0);
  if (!Number.isFinite(tvl)) return "-";
  if (tvl >= 1_000_000_000) return `$${(tvl / 1_000_000_000).toFixed(1)}B`;
  if (tvl >= 1_000_000) return `$${(tvl / 1_000_000).toFixed(1)}M`;
  if (tvl >= 1_000) return `$${(tvl / 1_000).toFixed(1)}K`;
  return `$${tvl.toFixed(0)}`;
}

function VaultSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
          <div className="h-4 w-28 bg-white/5 animate-pulse rounded" />
          <div className="flex gap-4">
            <div className="h-4 w-14 bg-white/5 animate-pulse rounded" />
            <div className="h-4 w-10 bg-white/5 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </>
  );
}

export function VaultsSample() {
  const { vaults, isLoading } = useVaults({ sortBy: "tvl" });

  const top5 = vaults.slice(0, 5);

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white">Top Vaults</h3>
        <Link
          href="/explorer/vaults"
          className="text-xs text-brand-accent hover:text-brand-accent/80 transition-colors"
        >
          View all →
        </Link>
      </div>
      <div className="space-y-0">
        {isLoading && top5.length === 0 ? (
          <VaultSkeleton />
        ) : top5.length === 0 ? (
          <p className="text-text-secondary text-sm py-4 text-center">No vaults found</p>
        ) : (
          top5.map((vault) => (
            <div
              key={vault.summary?.vaultAddress}
              className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0"
            >
              <span className="text-sm text-white truncate max-w-[140px]">
                {vault.summary?.name ?? "-"}
              </span>
              <div className="flex gap-4 text-xs text-text-secondary shrink-0">
                <span>{formatTVL(vault.summary?.tvl)}</span>
                <span className="text-brand-accent">
                  {vault.apr !== undefined ? `${vault.apr.toFixed(1)}%` : "-"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
