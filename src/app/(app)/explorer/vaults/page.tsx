import React from "react";
import { VaultKpiBar, VaultEcosystemChart, VaultEnhancedTable } from "@/components/explorer/vault";

export default function VaultsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-inter text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Vaults
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          HyperLiquid vaults — ecosystem KPIs, TVL distribution, and the full vault directory with performance metrics.
        </p>
      </div>

      {/* KPI bar */}
      <VaultKpiBar />

      {/* Ecosystem chart */}
      <VaultEcosystemChart />

      {/* Enhanced vaults table */}
      <VaultEnhancedTable />
    </div>
  );
}
