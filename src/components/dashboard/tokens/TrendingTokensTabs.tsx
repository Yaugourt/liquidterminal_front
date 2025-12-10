"use client";

import { useState } from "react";
import { TrendingTokens } from "./TrendingTokens";
import { AuctionSection } from "./AuctionSection";
import { PastAuctionSection } from "./PastAuctionSection";
import { PillTabs } from "@/components/ui/pill-tabs";

interface TrendingTokensTabsProps {
  onTabChange?: (tab: "perp" | "spot" | "auction" | "past-auction") => void;
  onPastAuctionHeightChange?: (height: number) => void;
}

export const TrendingTokensTabs = ({ onTabChange, onPastAuctionHeightChange }: TrendingTokensTabsProps = {}) => {
  const [activeTab, setActiveTab] = useState<"perp" | "spot" | "auction" | "past-auction">("perp");

  const handleTabChange = (tab: "perp" | "spot" | "auction" | "past-auction") => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const tabs: { key: "perp" | "spot" | "auction" | "past-auction"; label: string }[] = [
    { key: 'perp', label: 'Perpetual' },
    { key: 'spot', label: 'Spot' },
    { key: 'auction', label: 'Auction' },
    { key: 'past-auction', label: 'Past Auction' }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header avec TabSelector - Style V2 Pills */}
      <div className="flex items-center gap-2 p-4 border-b border-white/5">
        <div className="flex">
          <PillTabs
            tabs={tabs.map(t => ({ value: t.key, label: t.label }))}
            activeTab={activeTab}
            onTabChange={(val) => handleTabChange(val as "spot" | "perp" | "auction" | "past-auction")}
            className="bg-[#0A0D12] border border-white/5"
          />
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="flex-1 flex flex-col p-2">
        {activeTab === "auction" ? (
          <AuctionSection />
        ) : activeTab === "past-auction" ? (
          <PastAuctionSection onHeightChange={onPastAuctionHeightChange} />
        ) : (
          <TrendingTokens
            type={activeTab}
            title={activeTab === "perp" ? "Trending Perpetual" : "Trending Spot"}
          />
        )}
      </div>
    </div>
  );
};
