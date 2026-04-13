"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
import { useVaultIndexerDetails } from "@/services/explorer/vault/hooks/useVaultIndexerDetails";
import { useVaultSummaries } from "@/services/explorer/vault/hooks/useVaultSummaries";
import {
  VaultDetailHeader,
  VaultDetailKpiRow,
  VaultDetailCharts,
  VaultLedgerTable,
} from "@/components/explorer/vault";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "ledger", label: "Ledger" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function VaultDetailPage() {
  const params = useParams();
  const vaultAddress = params.address as string;

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(new Set<TabId>(["overview"]));

  const { details, isLoading: detailsLoading, error: detailsError } =
    useVaultIndexerDetails({ vaultAddress });

  const { summaries, isLoading: summariesLoading } = useVaultSummaries({
    includeClosed: true,
    limit: 500,
  });

  const summaryFallback = useMemo(
    () => summaries.find((s) => s.vaultAddress.toLowerCase() === vaultAddress.toLowerCase()) ?? null,
    [summaries, vaultAddress]
  );

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    setVisitedTabs((prev) => {
      if (prev.has(tabId)) return prev;
      const next = new Set(prev);
      next.add(tabId);
      return next;
    });
  }, []);

  const isLoading = detailsLoading || summariesLoading;

  if (detailsError && !summaryFallback && !isLoading) {
    return (
      <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 text-center text-rose-400 text-sm">
        Failed to load vault data: {detailsError.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vault header */}
      <VaultDetailHeader
        vaultAddress={vaultAddress}
        details={details}
        summaryFallback={summaryFallback}
        isLoading={isLoading}
      />

      {/* KPI row */}
      <VaultDetailKpiRow
        vaultAddress={vaultAddress}
        isLoading={isLoading}
      />

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-border-subtle pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`text-sm font-medium px-4 py-2 border-b-2 transition-all -mb-px ${
              activeTab === tab.id
                ? "border-brand-accent text-brand-accent"
                : "border-transparent text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — lazy mount + keep alive pattern */}

      {visitedTabs.has("overview") && (
        <div className={activeTab === "overview" ? "space-y-4" : "hidden"}>
          <VaultDetailCharts vaultAddress={vaultAddress} />
        </div>
      )}

      {visitedTabs.has("ledger") && (
        <div className={activeTab === "ledger" ? "" : "hidden"}>
          <VaultLedgerTable vaultAddress={vaultAddress} />
        </div>
      )}
    </div>
  );
}
