import React from "react";
import { VaultKpiBar, VaultEcosystemChart, VaultEnhancedTable } from "@/components/explorer/vault";

export default function VaultsPage() {
  return (
    <div className="space-y-6">
      {/* KPI bar */}
      <VaultKpiBar />

      {/* Ecosystem chart */}
      <VaultEcosystemChart />

      {/* Enhanced vaults table */}
      <VaultEnhancedTable />
    </div>
  );
}
