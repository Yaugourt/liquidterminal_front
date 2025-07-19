"use client";

import { Dispatch, SetStateAction } from "react";

interface TokenTabsProps {
  market: 'spot' | 'perp';
  activeTab?: string;
  setActiveTab?: Dispatch<SetStateAction<string>>;
}

export function TokenTabs({ market, activeTab, setActiveTab }: TokenTabsProps) {
  // Tabs différents selon le marché
  const tabs: { key: string; label: string }[] = market === 'spot' 
    ? [
        { key: 'all', label: 'All' },
        { key: 'strict', label: 'Strict' }
      ]
    : [
        { key: 'all', label: 'All' }
      ];

  // Pour perp, on n'a qu'un seul tab donc on peut le rendre statique
  const currentActiveTab = activeTab || 'all';
  const handleTabClick = setActiveTab || (() => {});

  return (
    <div className="flex justify-start items-center mb-4">
      <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              currentActiveTab === tab.key
                ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
} 