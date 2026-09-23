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
import { PillTabs } from "@/components/ui/pill-tabs";
import {
  BuildersGlobalStatsStrip,
  BuildersOverviewChart,
  BuildersFlowChart,
  BuildersTopTable,
  BuildersAllTable,
} from "@/components/market/builders";
import { PageHeader, TimeframeTabs, PageFaq, DataStatus, SourceBadge, combinedSourceStatus, TableStat } from "@/components/common";
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
  const [view, setView] = useState<"top" | "all">("top");

  const viewTabs = (
    <PillTabs
      variant="text"
      tabs={[
        { value: "top", label: "Top builders" },
        { value: "all", label: `All builders (${list.builders.length > 0 ? list.builders.length : "…"})` },
      ]}
      activeTab={view}
      onTabChange={(v) => setView(v as "top" | "all")}
    />
  );

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
          <>
            <SourceBadge source="hypedexer" status={combinedSourceStatus(allTf, top, list)} />
            <DataStatus
              variant="polled"
              updatedAt={allTf.dataUpdatedAt}
              isRefreshing={allTf.isRefreshing}
              onRefresh={allTf.refetch}
            />
            <TimeframeTabs
              options={TIMEFRAMES}
              value={tf}
              onChange={(v) => setTf(v as BuildersTimeframe)}
            />
          </>
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

      {/* Directory — one table at a time; the view switcher lives in its toolbar */}
      {view === "top" ? (
        <BuildersTopTable
          rows={top.data?.builders ?? []}
          isLoading={top.isLoading}
          error={top.error}
          onRetry={top.refetch}
          toolbar={
            <>
              {viewTabs}
              <TableStat
                className="ml-auto"
                label="Sorted by volume · window"
                value={top.data?.timeframe ?? tf}
              />
            </>
          }
        />
      ) : (
        <BuildersAllTable
          builders={list.builders}
          isLoading={list.isLoading}
          error={list.error}
          onRetry={list.refetch}
          tabs={viewTabs}
        />
      )}
      <PageFaq items={BUILDERS_FAQ} />
    </motion.div>
  );
}
