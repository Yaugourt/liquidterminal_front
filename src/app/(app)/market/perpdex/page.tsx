"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePageTitle } from "@/store/use-page-title";
import {
  PerpDexStatsCard,
  PerpDexTable,
  TopPerpDexsCard,
  TopHip3MarketsCard,
  PastAuctionsPerpTable,
  Hip3MarketsExplorer,
} from "@/components/market/perpDex";
import { PillTabs } from "@/components/ui/pill-tabs";
import { PageHeader, PageFaq, DataStatus, SourceBadge, sourceStatus } from "@/components/common";
import { usePerpDexMarketDataStore } from "@/services/market/perpDex/websocket.service";
import { usePastAuctionsPerp } from "@/services/market/perpDex/hooks";
import { PERPDEX_FAQ } from "@/lib/page-faqs";

export default function PerpDexsPage() {
  const { setTitle } = usePageTitle();
  // Market figures (vol/OI/funding/price) are WebSocket-pushed — surface a
  // single page-level live cue. Read the connection flag straight from the
  // shared store (the cards below drive the actual connection): a pure read,
  // no duplicate REST poll and no re-render on every market tick.
  const wsConnected = usePerpDexMarketDataStore((s) => s.isConnected);
  const [tab, setTab] = useState<"builder-dexs" | "auction-pairs">("builder-dexs");
  // Auction pairs come from Hypurrscan `/pastAuctionsPerp`; the same GET is
  // 30s-cached so this shares PastAuctionsPerpTable's fetch for the badge.
  const pastAuctions = usePastAuctionsPerp();

  const viewTabs = (
    <PillTabs
      variant="text"
      tabs={[
        { value: "builder-dexs", label: "All Builder DEXs" },
        { value: "auction-pairs", label: "Auction Pairs" },
      ]}
      activeTab={tab}
      onTabChange={(v) => setTab(v as typeof tab)}
    />
  );

  useEffect(() => {
    setTitle("Perp DEX - Market");
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
        title="Perp DEX"
        titleQualifier="· HIP-3 builder markets"
        description="Builder-deployed perp DEXs on Hyperliquid — ecosystem stats, top venues, HIP-3 markets, and auction pairs."
        actions={<DataStatus variant="live" connected={wsConnected} />}
      />

      {/* Stats strip */}
      <PerpDexStatsCard />

      {/* Secondary cards */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TopPerpDexsCard />
        <TopHip3MarketsCard />
      </div>

      {/* Ecosystem-wide markets explorer (with mark-vs-oracle basis) */}
      <Hip3MarketsExplorer />

      {/* Directory — one table at a time; the view switcher lives in its toolbar */}
      {tab === "builder-dexs" ? (
        <PerpDexTable toolbar={viewTabs} />
      ) : (
        <PastAuctionsPerpTable
          toolbar={
            <>
              {viewTabs}
              <SourceBadge
                source="hypurrscan"
                status={sourceStatus(pastAuctions.error, pastAuctions.isLoading)}
                className="ml-auto"
              />
            </>
          }
        />
      )}
      <PageFaq items={PERPDEX_FAQ} />
    </motion.div>
  );
}
