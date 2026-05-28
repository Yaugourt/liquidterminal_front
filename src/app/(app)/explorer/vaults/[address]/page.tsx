"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useVaultIndexerDetails } from "@/services/explorer/vault/hooks/useVaultIndexerDetails";
import { useVaultSummaries } from "@/services/explorer/vault/hooks/useVaultSummaries";
import { useVaults } from "@/services/explorer/vault/hooks/useVaults";
import {
  VaultDetailHeader,
  VaultDetailKpiRow,
  VaultDetailCharts,
  VaultSecondaryCharts,
  VaultLedgerTable,
  VaultConcentrationBar,
  VaultMetadataCard,
  VaultCommissionHistory,
  VaultSubVaults,
} from "@/components/explorer/vault";

export default function VaultDetailPage() {
  const params = useParams();
  const vaultAddress = params.address as string;

  const { details, isLoading: detailsLoading, error: detailsError } = useVaultIndexerDetails({
    vaultAddress,
  });

  const { summaries, isLoading: summariesLoading } = useVaultSummaries({
    includeClosed: true,
    limit: 5000,
  });

  const { vaults } = useVaults({ limit: 1000 });

  const summaryFallback = useMemo(
    () =>
      summaries.find((s) => s.vaultAddress.toLowerCase() === vaultAddress.toLowerCase()) ?? null,
    [summaries, vaultAddress]
  );

  const childAddresses = useMemo(() => {
    const match = vaults.find(
      (v) => v.summary.vaultAddress.toLowerCase() === vaultAddress.toLowerCase()
    );
    return match?.summary.relationship?.data?.childAddresses ?? [];
  }, [vaults, vaultAddress]);

  const isLoading = detailsLoading || summariesLoading;

  if (detailsError && !summaryFallback && !isLoading) {
    return (
      <div className="bg-danger/5 border border-danger/20 rounded-lg p-6 text-center text-danger text-sm">
        Failed to load vault data: {detailsError.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <nav
        className="flex items-center gap-1 text-xs text-text-tertiary"
        aria-label="Breadcrumb"
      >
        <Link href="/explorer/vaults" className="hover:text-brand transition-colors">
          Vaults
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-text-secondary truncate max-w-[480px]">
          {details?.name ?? summaryFallback?.name ?? (
            <span className="mono">
              {vaultAddress.slice(0, 8)}…{vaultAddress.slice(-4)}
            </span>
          )}
        </span>
      </nav>

      <VaultDetailHeader
        vaultAddress={vaultAddress}
        details={details}
        summaryFallback={summaryFallback}
        isLoading={isLoading}
      />

      <VaultDetailKpiRow vaultAddress={vaultAddress} isLoading={isLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-3 items-start">
        <div className="flex flex-col gap-3 min-w-0">
          <VaultDetailCharts vaultAddress={vaultAddress} />
          <VaultSecondaryCharts vaultAddress={vaultAddress} />
          <VaultLedgerTable vaultAddress={vaultAddress} />
        </div>
        <aside className="flex flex-col gap-3">
          <VaultMetadataCard
            vaultAddress={vaultAddress}
            details={details}
            summaryFallback={summaryFallback}
            childAddresses={childAddresses}
          />
          <VaultCommissionHistory portfolio={details?.portfolio} />
          {childAddresses.length > 0 && <VaultSubVaults childAddresses={childAddresses} />}
          <VaultConcentrationBar vaultAddress={vaultAddress} />
        </aside>
      </div>
    </div>
  );
}
