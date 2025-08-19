"use client";

import { useState } from "react";
import { AuctionCard } from "@/components/market/auction/AuctionCard";

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
        <AuctionCard key={activeSubTab} marketType={activeSubTab} />
      </div>
    </div>
  );
}; 