"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import {
  useBuildersList,
  useBuildersStatsAllTimeframes,
  useBuildersTop,
  type BuildersTimeframe,
} from "@/services/indexer/builders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const tfLayoutId = useId().replace(/:/g, "");

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
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-semibold text-text-primary leading-tight">Builders</h1>
          <p className="text-text-secondary text-sm mt-1 max-w-2xl">
            Referral builders on HyperLiquid — global activity, top builders by volume, and the full directory.
          </p>
        </div>
        {/* Timeframe pills (V4) — layoutId motion keeps the smooth transition */}
        <div className="flex items-center bg-surface-2 border border-border-subtle rounded-md p-0.5 w-fit">
          {TIMEFRAMES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTf(t)}
              className="relative rounded text-xs font-medium px-2.5 py-1"
            >
              {tf === t && (
                <motion.span
                  layoutId={`builders-tf-${tfLayoutId}`}
                  className="absolute inset-0 rounded bg-brand"
                  transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                />
              )}
              <span className={`mono relative z-10 ${tf === t ? "text-brand-text-on" : "text-text-tertiary hover:text-text-primary"}`}>
                {t}
              </span>
            </button>
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
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

      {/* Table card — single shell containing sub-tabs + meta in the header */}
      <Tabs defaultValue="top" className="w-full">
        <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
          {/* Card header: tabs (left) + meta (right) */}
          <div className="flex items-center justify-between px-3.5 py-3 border-b border-border-subtle">
            <TabsList className="bg-surface-2 p-0.5 rounded-md h-auto">
              <TabsTrigger
                value="top"
                className="data-[state=active]:bg-brand data-[state=active]:text-brand-text-on data-[state=active]:shadow-none text-text-tertiary px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
              >
                Top builders
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-brand data-[state=active]:text-brand-text-on data-[state=active]:shadow-none text-text-tertiary px-2.5 py-1 rounded text-[11px] font-medium transition-colors"
              >
                All builders ({list.builders.length > 0 ? list.builders.length : "…"})
              </TabsTrigger>
            </TabsList>
            <span className="text-[10px] text-text-tertiary tracking-wide">
              Sorted by volume · window <span className="mono">{top.data?.timeframe ?? tf}</span>
            </span>
          </div>

          <TabsContent value="top" className="mt-0">
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
        </div>
      </Tabs>
    </motion.div>
  );
}
