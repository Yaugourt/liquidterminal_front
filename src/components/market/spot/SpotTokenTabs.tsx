"use client";

import { Dispatch, SetStateAction } from "react";

export function SpotTokenTabs({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: Dispatch<SetStateAction<string>> }) {
  const tabs: { key: string; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'strict', label: 'Strict' }
  ];

  return (
    <div className="flex justify-start items-center mb-4">
      <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                : 'text-[#FFFFFF99] hover:text-white hover:bg-[#FFFFFF0A]'
            }`}
          >
            {tab.label}
      </button>
        ))}
      </div>
    </div>
  );
}
