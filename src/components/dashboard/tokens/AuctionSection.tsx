"use client";

import { useState } from "react";
import { AuctionCard as SpotAuctionCard } from "@/components/market/spot/auction/AuctionCard";

export const AuctionSection = () => {
  const [activeSubTab, setActiveSubTab] = useState<"spot" | "perp">("spot");

  const subTabs: { key: "spot" | "perp"; label: string }[] = [
    { key: 'spot', label: 'Spot' },
    { key: 'perp', label: 'Perp' }
  ];

  // Simple tab change handler
  const handleTabChange = (newTab: "spot" | "perp") => {
    setActiveSubTab(newTab);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header avec sous-tabs */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1 w-fit">
          {subTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeSubTab === tab.key
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
        {activeSubTab === "spot" ? (
          <SpotAuctionCard />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-[#051728E5] border border-[#83E9FF4D] rounded-lg">
            <span className="text-white text-lg font-medium mb-2">Coming Soon</span>
            <span className="text-[#FFFFFF80] text-sm">Perp auctions will be available soon</span>
          </div>
        )}
      </div>
    </div>
  );
}; 