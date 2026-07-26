"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common";
import { ExportButton } from "@/components/export/ExportButton";
import type { UseVaultsDirectoryResult } from "@/services/explorer/vault/hooks/useVaultsDirectory";

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

export function VaultsListHeader({ directory }: VaultsListHeaderProps) {
  const { dataUpdatedAt } = directory;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  const updatedLabel = dataUpdatedAt ? formatRelative(now - dataUpdatedAt) : "…";

  // Header carries no stats — those live in the KPI cards, never duplicated
  // outside them. Just the freshness indicator.
  const description = (
    <span className="text-xs text-text-tertiary">
      updated <span className="mono text-text-secondary">{updatedLabel}</span>
    </span>
  );

  return (
    <PageHeader
      title="Vaults"
      titleQualifier="on Hyperliquid"
      description={description}
      actions={
        <>
          <ExportButton datasetId="vault-summaries" label="Export CSV" />
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
