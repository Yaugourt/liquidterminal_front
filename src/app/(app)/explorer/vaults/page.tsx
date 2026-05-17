import React from "react";
import { VaultKpiBar, VaultEcosystemChart, VaultEnhancedTable } from "@/components/explorer/vault";
import { PageHeader } from "@/components/common";

export default function VaultsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Vaults"
        description="HyperLiquid vaults — ecosystem KPIs, TVL distribution, and the full vault directory with performance metrics."
      />

      {/* KPI bar */}
      <VaultKpiBar />

      {/* Ecosystem chart */}
      <VaultEcosystemChart />

      {/* Enhanced vaults table */}
      <VaultEnhancedTable />
    </div>
  );
}
