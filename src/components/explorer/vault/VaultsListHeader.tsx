"use client";

import { useEffect, useState } from "react";
import { Download, ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common";
import { compactUsd, compactCount } from "@/lib/formatters/numberFormatting";
import type {
  UseVaultsDirectoryResult,
  VaultRow,
} from "@/services/explorer/vault/hooks/useVaultsDirectory";

interface VaultsListHeaderProps {
  directory: UseVaultsDirectoryResult;
}

function formatRelative(ms: number): string {
  if (ms < 5_000) return "just now";
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

function buildCsv(rows: VaultRow[]): string {
  const header = [
    "rank",
    "name",
    "address",
    "leader",
    "tvl",
    "apr_percent",
    "followers",
    "commission_percent",
    "isClosed",
    "createdAtMs",
  ];
  const lines = rows.map((r, i) => {
    const esc = (v: string | number | boolean | null) => {
      const s = v === null || v === undefined ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    return [
      i + 1,
      esc(r.summary.name),
      r.summary.vaultAddress,
      r.summary.leader,
      r.summary.tvl,
      r.apr.toFixed(4),
      r.followerCount ?? "",
      r.leaderCommission !== null ? (r.leaderCommission * 100).toFixed(2) : "",
      r.summary.isClosed,
      r.summary.createTimeMillis,
    ].join(",");
  });
  return [header.join(","), ...lines].join("\n");
}

function downloadCsv(rows: VaultRow[]) {
  const blob = new Blob([buildCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `liquid-terminal-vaults-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function VaultsListHeader({ directory }: VaultsListHeaderProps) {
  const { totalCount, totalTvl, totalFollowers, dataUpdatedAt, filtered } = directory;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const updatedLabel = dataUpdatedAt ? formatRelative(now - dataUpdatedAt) : "…";

  const description = (
    <span className="flex flex-col gap-1.5">
      <span>
        The full HyperLiquid vault directory — ranked by TVL, with leader,
        commission, follower count and performance.
      </span>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-tertiary">
        {totalCount > 0 && (
          <>
            <span>
              <span className="mono text-text-secondary">{compactCount(totalCount)}</span> vaults
            </span>
            <span className="text-text-tertiary/60">·</span>
          </>
        )}
        {totalTvl > 0 && (
          <>
            <span>
              <span className="mono text-text-secondary">{compactUsd(totalTvl)}</span> total TVL
            </span>
            <span className="text-text-tertiary/60">·</span>
          </>
        )}
        {totalFollowers > 0 && (
          <>
            <span>
              <span className="mono text-text-secondary">{compactCount(totalFollowers)}</span>{" "}
              depositors
            </span>
            <span className="text-text-tertiary/60">·</span>
          </>
        )}
        <span>
          updated <span className="mono text-text-secondary">{updatedLabel}</span>
        </span>
      </span>
    </span>
  );

  return (
    <PageHeader
      title="Vaults"
      description={description}
      actions={
        <>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={() => downloadCsv(filtered)}
            disabled={filtered.length === 0}
            title={
              filtered.length === 0
                ? "No rows to export"
                : `Export ${filtered.length} filtered rows`
            }
          >
            <Download className="h-3 w-3" />
            Export CSV
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold bg-brand hover:bg-brand/90 text-brand-text-on"
            onClick={() =>
              window.open("https://app.hyperliquid.xyz/vaults", "_blank", "noopener,noreferrer")
            }
          >
            <Plus className="h-3 w-3" />
            Create Vault
            <ExternalLink className="h-3 w-3 opacity-70" />
          </Button>
        </>
      }
    />
  );
}
