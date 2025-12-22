"use client";

import React from "react";
import { Wallet, List } from "lucide-react";
import { PillTabs } from "@/components/ui/pill-tabs";

interface TrackerNavigationProps {
  activeTab: "wallets" | "lists";
  onChange: (tabId: "wallets" | "lists") => void;
}

export function TrackerNavigation({ activeTab, onChange }: TrackerNavigationProps) {
  const tabs = [
    { id: "wallets" as const, label: "My Wallets", icon: Wallet },
    { id: "lists" as const, label: "Wallet Lists", icon: List }
  ];

  return (
    <div className="flex justify-start items-center mb-6">
      <PillTabs
        tabs={tabs.map(tab => ({
          value: tab.id,
          label: (
            <div className="flex items-center gap-2">
              <tab.icon size={16} />
              {tab.label}
            </div>
          )
        }))}
        activeTab={activeTab}
        onTabChange={(val) => onChange(val as "wallets" | "lists")}
        className="bg-[#FFFFFF0A]"
      />
    </div>
  );
}
