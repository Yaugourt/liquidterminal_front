"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import {
  SmartMoneyBoard,
  SmartMoneyPositioning,
  PublicListsPreview,
  TrackedWalletsPreview,
  ActiveUsersPreview,
  TrackerStatsBar
} from "@/components/market/tracker/home";
import { PageHeader, PageFaq, DataStatus } from "@/components/common";
import { useTopTraders } from "@/services/market/toptraders";
import { TRACKER_FAQ } from "@/lib/page-faqs";

/**
 * Home page du Tracker - Accessible publiquement
 * Affiche: Top Traders 24h, Public Lists Preview, Your Tracked Wallets
 */
export default function TrackerHome() {
  const { setTitle } = usePageTitle();
  // Page-level freshness cue wired to the tracker's primary polled source (top
  // traders); the same GET backs TrackerStatsBar/TopTradersPreview and is cached.
  const topTraders = useTopTraders({ sort: "pnl_pos", limit: 50 });

  useEffect(() => {
    setTitle("Wallet Tracker");
  }, [setTitle]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Wallet Tracker"
        titleQualifier="for Hyperliquid"
        description="Track wallets across Hyperliquid — top traders, public lists, most active users, and your personal watchlist."
        actions={
          <DataStatus
            variant="polled"
            updatedAt={topTraders.dataUpdatedAt}
            isRefreshing={topTraders.isRefreshing}
            onRefresh={topTraders.refetch}
          />
        }
      />

      {/* Stats Bar */}
      <TrackerStatsBar />

      {/* Smart Money — full-width ranked leaderboard (winners/losers/whales/active) */}
      <SmartMoneyBoard />

      {/* Smart Money positioning — collective long/short of the cohort, by market */}
      <SmartMoneyPositioning />

      {/* Active Users + Public Lists - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ActiveUsersPreview />
        <PublicListsPreview />
      </div>

      {/* Your Wallets - full width */}
      <TrackedWalletsPreview />
      <PageFaq items={TRACKER_FAQ} />
    </div>
  );
}
