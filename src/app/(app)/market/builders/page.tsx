"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import {
  useBuildersList,
  useBuildersStatsAllTimeframes,
  useBuildersTop,
  type BuildersTimeframe,
} from "@/services/indexer/builders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BuildersGlobalStatsStrip,
  BuildersOverviewChart,
  BuildersFlowChart,
  BuildersTopTable,
  BuildersAllTable,
} from "@/components/market/builders";

const TIMEFRAMES: BuildersTimeframe[] = ["1h", "24h", "7d", "30d"];

export default function MarketBuildersPage() {
  const { setTitle } = usePageTitle();
  const [tf, setTf] = useState<BuildersTimeframe>("24h");

  const allTf = useBuildersStatsAllTimeframes();
  const top = useBuildersTop({ timeframe: tf, sort: "volume", limit: 100 });
  const list = useBuildersList();

  const currentStats = useMemo(() => {
    if (!allTf.stats) return null;
    const slice = allTf.stats[tf];
    if (!slice) return null;
    return { timeframe: tf, ...slice };
  }, [allTf.stats, tf]);

  useEffect(() => {
    setTitle("Builders - Market");
  }, [setTitle]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Builders</h1>
          <p className="text-text-secondary text-sm mt-1 max-w-2xl">
            Referral builders on HyperLiquid — global activity, top builders by volume, and the full directory.
          </p>
        </div>
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
      </div>

      {/* Stats strip — 4 cards with icons + variation badges */}
      <BuildersGlobalStatsStrip
        stats={currentStats}
        isLoading={allTf.isLoading}
        error={allTf.error}
      />

      {/* Charts — market share donut + flow comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <BuildersOverviewChart
          rows={top.data?.builders ?? []}
          isLoading={top.isLoading}
          timeframe={tf}
        />
        <BuildersFlowChart
          rows={top.data?.builders ?? []}
          isLoading={top.isLoading}
          timeframe={tf}
        />
      </div>

      {/* Table tabs */}
      <Tabs defaultValue="top" className="w-full">
        <TabsList className="bg-brand-secondary/60 border border-border-subtle p-1 rounded-xl mb-4">
          <TabsTrigger
            value="top"
            className="data-[state=active]:bg-brand-accent/20 data-[state=active]:text-brand-accent text-text-secondary px-4 py-2 rounded-lg transition-all"
          >
            Top builders
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-brand-accent/20 data-[state=active]:text-brand-accent text-text-secondary px-4 py-2 rounded-lg transition-all"
          >
            All builders ({list.builders.length > 0 ? list.builders.length : "…"})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="top" className="mt-0 space-y-2">
          <p className="text-text-muted text-xs px-1">
            Sorted by volume · window {top.data?.timeframe ?? tf}
          </p>
          <BuildersTopTable
            rows={top.data?.builders ?? []}
            isLoading={top.isLoading}
            error={top.error}
          />
        </TabsContent>
        <TabsContent value="all" className="mt-0">
          <BuildersAllTable
            builders={list.builders}
            isLoading={list.isLoading}
            error={list.error}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
