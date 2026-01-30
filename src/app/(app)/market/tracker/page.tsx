"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import {
  TopTradersPreview,
  PublicListsPreview,
  TrackedWalletsPreview,
  ActiveUsersPreview,
  TrackerStatsBar
} from "@/components/market/tracker/home";

/**
 * Home page du Tracker - Accessible publiquement
 * Affiche: Top Traders 24h, Public Lists Preview, Your Tracked Wallets
 */
export default function TrackerHome() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Wallet Tracker");
  }, [setTitle]);

  return (
    <div className="space-y-8">
      {/* Stats Bar */}
      <TrackerStatsBar />

      {/* Top Traders & Active Users - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopTradersPreview />
        <ActiveUsersPreview />
      </div>

      {/* Public Lists + Your Wallets - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PublicListsPreview />
        <TrackedWalletsPreview />
      </div>
    </div>
  );
}
