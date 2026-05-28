"use client";

import { motion } from "framer-motion";
import {
  VaultsKpiStrip,
  VaultsDirectoryTable,
  VaultsListHeader,
  VaultsLeaderboards,
} from "@/components/explorer/vault";
import { useVaultsDirectory } from "@/services/explorer/vault/hooks/useVaultsDirectory";

export default function VaultsPage() {
  const directory = useVaultsDirectory();

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <VaultsListHeader directory={directory} />
      <VaultsKpiStrip />
      <VaultsDirectoryTable directory={directory} />
      <VaultsLeaderboards directory={directory} />
    </motion.div>
  );
}
