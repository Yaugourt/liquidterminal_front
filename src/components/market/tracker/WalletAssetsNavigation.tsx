"use client";

import React from "react";

interface WalletAssetsNavigationProps {
  activeTab: string;
  onChange: (tabId: string) => void;
}

export function WalletAssetsNavigation({ activeTab, onChange }: WalletAssetsNavigationProps) {
  const tabs = [
    { id: "holdings", label: "Holdings" },
    { id: "orders", label: "Orders" },
    { id: "twap", label: "TWAP" },
    { id: "recent-fills", label: "Recent Fills" }
  ];

  return (
    <div className="flex justify-start items-center mb-4">
      <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-[#83E9FF] text-[#051728] shadow-sm font-bold"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
            }`}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
} 