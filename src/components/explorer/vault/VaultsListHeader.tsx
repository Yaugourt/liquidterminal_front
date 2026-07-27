"use client";

import { ExternalLink, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, DataStatus } from "@/components/common";
import { ExportButton } from "@/components/export/ExportButton";
import type { UseVaultsDirectoryResult } from "@/services/explorer/vault/hooks/useVaultsDirectory";

interface VaultsListHeaderProps {
  directory: UseVaultsDirectoryResult;
}

export function VaultsListHeader({ directory }: VaultsListHeaderProps) {
  const { dataUpdatedAt, isRefreshing, refetch } = directory;

  // Header carries no stats — those live in the KPI cards, never duplicated
  // outside them. The freshness cue + manual refresh live in the actions slot.
  return (
    <PageHeader
      title="Vaults"
      titleQualifier="on Hyperliquid"
      actions={
        <>
          <DataStatus
            variant="polled"
            updatedAt={dataUpdatedAt}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
          />
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
