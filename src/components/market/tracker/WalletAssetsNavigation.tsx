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
      <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-[#83E9FF] text-[#051728] shadow-sm"
                : "text-white hover:text-white hover:bg-[#FFFFFF0A]"
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