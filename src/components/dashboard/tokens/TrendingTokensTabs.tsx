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
    { key: 'past-auction', label: 'Past auction' }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header avec TabSelector */}
      <div className="flex justify-start items-center mb-4">
        <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                  : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="flex-1 flex flex-col">
        {activeTab === "auction" ? (
          <AuctionSection />
        ) : activeTab === "past-auction" ? (
          <PastAuctionSection onHeightChange={onPastAuctionHeightChange} />
        ) : (
          <TrendingTokens 
            type={activeTab} 
            title={activeTab === "perp" ? "Trending perpetual" : "Trending spot"} 
          />
        )}
      </div>
    </div>
  );
}; 