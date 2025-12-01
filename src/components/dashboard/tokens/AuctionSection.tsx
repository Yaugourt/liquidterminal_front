"use client";

import { useState } from "react";
import { AuctionCard } from "@/components/market/auction/AuctionCard";

export const AuctionSection = () => {
  const [activeSubTab, setActiveSubTab] = useState<"spot" | "perp">("spot");

  const subTabs: { key: "spot" | "perp"; label: string }[] = [
    { key: 'spot', label: 'Spot' },
    { key: 'perp', label: 'Perp' }
  ];

  const handleTabChange = (newTab: "spot" | "perp") => {
    setActiveSubTab(newTab);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
          {subTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${
                activeSubTab === tab.key
                  ? 'bg-[#83E9FF] text-[#051728] shadow-sm font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <AuctionCard key={activeSubTab} marketType={activeSubTab} />
      </div>
    </div>
  );
};
