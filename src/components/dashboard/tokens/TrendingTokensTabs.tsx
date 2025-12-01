"use client";

import { useState } from "react";
import { TrendingTokens } from "./TrendingTokens";
import { AuctionSection } from "./AuctionSection";
import { PastAuctionSection } from "./PastAuctionSection";

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
      <div className="flex items-center gap-2 p-3 pb-0 border-b border-white/5 bg-black/20">
        <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-[#83E9FF] text-[#051728] shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
