"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { AuctionCard as SpotAuctionCard } from "@/components/market/spot/auction/AuctionCard";
import { AuctionCard as PerpAuctionCard } from "@/components/market/perp/auction/AuctionCard";

export const AuctionSection = () => {
  const [activeSubTab, setActiveSubTab] = useState<"spot" | "perp">("spot");

  const subTabs: { key: "spot" | "perp"; label: string }[] = [
    { key: 'spot', label: 'Spot' },
    { key: 'perp', label: 'Perp' }
  ];

  return (
    <div className="w-full">
      {/* Header avec sous-tabs et See All */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center bg-[#FFFFFF0A] rounded-md p-0.5 w-fit">
          {subTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors ${
                activeSubTab === tab.key
                  ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                  : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Link
          href={activeSubTab === "spot" ? "/market/spot/auction" : "/market/perp/auction"}
          className="flex items-center gap-1 px-3 py-1 text-sm text-[#f9e370] hover:text-white transition-colors"
        >
          See All
          <ExternalLink size={14} />
        </Link>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="min-h-[200px]">
        {activeSubTab === "spot" ? (
          <SpotAuctionCard />
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] bg-[#051728E5] border border-[#83E9FF4D] rounded-lg">
            <span className="text-white text-lg font-medium mb-2">Coming Soon</span>
            <span className="text-[#FFFFFF80] text-sm">Perp auctions will be available soon</span>
          </div>
        )}
      </div>
    </div>
  );
}; 