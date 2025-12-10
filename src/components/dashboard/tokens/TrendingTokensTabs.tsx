import { useState } from "react";
import { TrendingTokens } from "./TrendingTokens";
import { PastAuctionSection } from "./PastAuctionSection";
import { PillTabs } from "@/components/ui/pill-tabs";
import { AuctionCard } from "@/components/market/auction/AuctionCard";

interface TrendingTokensTabsProps {
  onTabChange?: (tab: "perp" | "spot" | "auction" | "past-auction") => void;
  onPastAuctionHeightChange?: (height: number) => void;
}

const AuctionSection = () => {
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
        <div className="flex bg-brand-dark rounded-lg p-1 border border-white/5">
          {subTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-3 py-1 rounded-md text-[10px] font-medium transition-all ${activeSubTab === tab.key
                  ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
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
            className="bg-brand-dark border border-white/5"
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
