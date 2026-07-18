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
import {
  BuildersGlobalStatsStrip,
  BuildersOverviewChart,
  BuildersFlowChart,
  BuildersTopTable,
  BuildersAllTable,
} from "@/components/market/builders";
import { PageHeader, TimeframeTabs, PageFaq } from "@/components/common";
import { BUILDERS_FAQ } from "@/lib/page-faqs";

const TIMEFRAMES: BuildersTimeframe[] = ["1h", "24h", "7d", "30d"];

export default function MarketBuildersPage() {
  const { setTitle } = usePageTitle();
  // Default to 7d: HypeDexer's builders ingestion currently lags on short
  // windows (1h/24h return zeros), so landing on 24h shows an empty page.
  const [tf, setTf] = useState<BuildersTimeframe>("7d");

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
      <PageHeader
        title="Builders"
        titleQualifier="· Hyperliquid builder codes"
        description="Referral builders on Hyperliquid — global activity, top builders by volume, and the full directory."
        actions={
          <TimeframeTabs
            options={TIMEFRAMES}
            value={tf}
            onChange={(v) => setTf(v as BuildersTimeframe)}
          />
        }
      />

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
              onRetry={top.refetch}
            />
          </TabsContent>
          <TabsContent value="all" className="mt-0">
            <BuildersAllTable
              builders={list.builders}
              isLoading={list.isLoading}
              error={list.error}
              onRetry={list.refetch}
            />
          </TabsContent>
        </div>
      </Tabs>
      <PageFaq items={BUILDERS_FAQ} />
    </motion.div>
  );
}
