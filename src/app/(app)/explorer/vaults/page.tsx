"use client";

import { motion } from "framer-motion";
import { VaultKpiBar, VaultEcosystemChart, VaultEnhancedTable } from "@/components/explorer/vault";
import { PageHeader } from "@/components/common";

export default function VaultsPage() {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Vaults"
        description="HyperLiquid vaults — ecosystem KPIs, TVL distribution, and the full vault directory with performance metrics."
      />

      {/* KPI strip */}
      <VaultKpiBar />

      {/* Ecosystem chart */}
      <VaultEcosystemChart />

      {/* Enhanced vaults table */}
      <VaultEnhancedTable />
    </motion.div>
  );
}
