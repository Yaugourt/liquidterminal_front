"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import {
  TopTradersPreview,
  PublicListsPreview,
  TrackedWalletsPreview
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
      {/* Hero Section */}
      <div className="glass-panel rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-white mb-2">Wallet Tracker</h1>
        <p className="text-text-secondary">
          Track top traders, discover public wallet lists, and monitor your favorite addresses
        </p>
      </div>

      {/* Top Traders Section - Full Width */}
      <TopTradersPreview />

      {/* Two Column Layout - Public Lists + Your Wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PublicListsPreview />
        <TrackedWalletsPreview />
      </div>
    </div>
  );
}
