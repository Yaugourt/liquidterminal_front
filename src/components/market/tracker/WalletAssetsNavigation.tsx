"use client";

import React from "react";
import { PillTabs } from "@/components/ui/pill-tabs";

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
      <div className="flex">
        <PillTabs
          tabs={tabs.map(t => ({ value: t.id, label: t.label }))}
          activeTab={activeTab}
          onTabChange={onChange}
          className="bg-[#0A0D12] border border-white/5"
        />
      </div>
    </div>
  );
} 