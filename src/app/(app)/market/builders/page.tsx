"use client";

import { useEffect, useState } from "react";
import { usePageTitle } from "@/store/use-page-title";
import {
  useBuildersGlobalStats,
  useBuildersList,
  useBuildersTop,
  type BuildersTimeframe,
} from "@/services/indexer/builders";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BuildersGlobalStatsStrip, BuildersTopTable, BuildersAllTable } from "@/components/market/builders";

const TIMEFRAMES: BuildersTimeframe[] = ["1h", "24h", "7d", "30d"];

export default function MarketBuildersPage() {
  const { setTitle } = usePageTitle();
  const [hubTf, setHubTf] = useState<BuildersTimeframe>("24h");

  const global = useBuildersGlobalStats(hubTf);
  const top = useBuildersTop({ timeframe: hubTf, sort: "volume", limit: 25 });
  const list = useBuildersList();

  useEffect(() => {
    setTitle("Builders - Market");
  }, [setTitle]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Builders</h1>
          <p className="text-text-secondary text-sm mt-1 max-w-2xl">
            Referral builders on HyperLiquid: global activity, top builders by volume, and the full directory.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {TIMEFRAMES.map((tf) => (
            <Button
              key={tf}
              type="button"
              size="sm"
              variant={hubTf === tf ? "default" : "outline"}
              className={
                hubTf === tf
                  ? "bg-brand-accent/20 text-brand-accent border-brand-accent/40"
                  : "border-border-subtle text-text-secondary hover:bg-white/5"
              }
              onClick={() => setHubTf(tf)}
            >
              {tf}
            </Button>
          ))}
        </div>
      </div>

      <BuildersGlobalStatsStrip stats={global.stats} isLoading={global.isLoading} error={global.error} />

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
            All builders
          </TabsTrigger>
        </TabsList>
        <TabsContent value="top" className="mt-0 space-y-2">
          <p className="text-text-muted text-xs px-1">
            Sorted by volume · window {top.data?.timeframe ?? hubTf}
          </p>
          <BuildersTopTable
            rows={top.data?.builders ?? []}
            isLoading={top.isLoading}
            error={top.error}
          />
        </TabsContent>
        <TabsContent value="all" className="mt-0">
          <BuildersAllTable builders={list.builders} isLoading={list.isLoading} error={list.error} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
