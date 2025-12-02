"use client";

import { Dispatch, SetStateAction } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TokenTabsProps {
  market: 'spot' | 'perp';
  activeTab?: string;
  setActiveTab?: Dispatch<SetStateAction<string>>;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function TokenTabs({ market, activeTab, setActiveTab, searchQuery, onSearchChange }: TokenTabsProps) {
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
    <div className="flex justify-between items-center mb-4">
      <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
              currentActiveTab === tab.key
                ? 'bg-[#83E9FF] text-[#051728] shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Barre de recherche */}
      <div className="relative max-w-xs">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery || ''}
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="pr-10 bg-[#0A0D12] border-white/5 text-white placeholder:text-zinc-500 focus:border-[#83E9FF]/50 focus:ring-[#83E9FF]/20 h-8 text-sm rounded-lg"
        />
      </div>
    </div>
  );
} 