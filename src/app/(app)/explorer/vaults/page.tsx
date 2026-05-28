"use client";

import { motion } from "framer-motion";
import { VaultsKpiStrip, VaultsDirectoryTable } from "@/components/explorer/vault";
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
        description="The full HyperLiquid vault directory — ranked by TVL, with leader, commission, follower count and performance."
      />
      <VaultsKpiStrip />
      <VaultsDirectoryTable />
    </motion.div>
  );
}
