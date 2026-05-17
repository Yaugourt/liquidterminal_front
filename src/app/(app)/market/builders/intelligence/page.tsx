"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import {
  useBuildersList,
  useBuilderStats,
  useBuilderUsers,
  type BuildersTimeframe,
} from "@/services/indexer/builders";
import { Button } from "@/components/ui/button";
import {
  BuilderSelector,
  BuilderCoinBreakdown,
  BuilderIntelligenceKpis,
  BuilderIntelligenceUsersTable,
  BuilderIntelligenceSecondaryStats,
} from "@/components/market/builders";
import { PageHeader } from "@/components/common";

const TIMEFRAMES: BuildersTimeframe[] = ["1h", "24h", "7d", "30d"];
const ETH = /^0x[a-fA-F0-9]{40}$/i;

export default function BuildersIntelligencePage() {
  const { setTitle } = usePageTitle();
  const [tf, setTf] = useState<BuildersTimeframe>("24h");
  const [selectedAddress, setSelectedAddress] = useState("");

  const list = useBuildersList();
  const stats = useBuilderStats(ETH.test(selectedAddress) ? selectedAddress : undefined, tf);
  const users = useBuilderUsers(ETH.test(selectedAddress) ? selectedAddress : undefined, {
    timeframe: tf,
    limit: 50,
  });

  useEffect(() => {
    if (!selectedAddress && list.builders.length > 0) {
      setSelectedAddress(list.builders[0].address);
    }
  }, [list.builders, selectedAddress]);

  useEffect(() => {
    setTitle("Builder Analytics");
  }, [setTitle]);

  const userRows = users.data?.users ?? [];
  const coinBreakdown = stats.stats?.coinBreakdown ?? [];

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Builder Analytics"
        description="Deep analytics on users trading via builder codes — revenue, behavior, and coin exposure."
        actions={
          <div className="flex flex-wrap gap-2">
            {TIMEFRAMES.map((t) => (
              <Button
                key={t}
                type="button"
                size="sm"
                onClick={() => setTf(t)}
                className={
                  tf === t
                    ? "bg-brand-accent/20 text-brand-accent border border-brand-accent/40 hover:bg-brand-accent/30"
                    : "border border-border-subtle text-text-secondary hover:bg-white/5 hover:text-white bg-transparent"
                }
              >
                {t}
              </Button>
            ))}
          </div>
        }
      />

      <BuilderSelector
        builders={list.builders}
        selectedAddress={selectedAddress}
        onSelect={setSelectedAddress}
      />

      <BuilderIntelligenceKpis stats={stats.stats} isLoading={stats.isLoading} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BuilderCoinBreakdown coins={coinBreakdown} isLoading={stats.isLoading} label={`Top Coins (${tf})`} />
        <BuilderIntelligenceUsersTable users={userRows} isLoading={users.isLoading} />
      </div>

      {stats.stats && (
        <BuilderIntelligenceSecondaryStats stats={stats.stats} />
      )}
    </motion.div>
  );
}
