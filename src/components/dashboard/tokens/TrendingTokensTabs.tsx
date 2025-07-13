"use client";

import { useState } from "react";
import { TrendingTokens } from "./TrendingTokens";
import { AuctionSection } from "./AuctionSection";

export const TrendingTokensTabs = () => {
  const [activeTab, setActiveTab] = useState<"perp" | "spot" | "auction">("perp");

  const tabs: { key: "perp" | "spot" | "auction"; label: string }[] = [
    { key: 'perp', label: 'Perpetual' },
    { key: 'spot', label: 'Spot' },
    { key: 'auction', label: 'Auction' }
  ];

  return (
    <div className="w-full">
      {/* Header avec TabSelector */}
      <div className="flex justify-start items-center mb-4">
        <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
      {activeTab === "auction" ? (
        <AuctionSection />
      ) : (
        <TrendingTokens 
          type={activeTab} 
          title={activeTab === "perp" ? "Trending perpetual" : "Trending spot"} 
        />
      )}
    </div>
  );
}; 