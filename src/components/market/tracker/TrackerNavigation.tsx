"use client";

import React from "react";
import { Wallet, List } from "lucide-react";

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
      <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[#83E9FF] text-[#051728] shadow-sm"
                  : "text-white hover:text-white hover:bg-[#FFFFFF0A]"
              }`}
              onClick={() => onChange(tab.id)}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
