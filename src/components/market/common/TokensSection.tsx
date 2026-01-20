"use client";

import { useState } from "react";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
// import { TokenTabs } from "./TokenTabs"; // Inlined
import { UniversalTokenTable } from "./UniversalTokenTable";

interface TokensSectionProps {
  market: 'spot' | 'perp';
}

export function TokensSection({ market }: TokensSectionProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
          {(market === 'spot'
            ? [{ key: 'all', label: 'All' }, { key: 'strict', label: 'Strict' }]
            : [{ key: 'all', label: 'All' }]
          ).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${(activeTab || 'all') === tab.key
                ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                : 'tab-inactive'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Barre de recherche */}
        <div className="relative max-w-xs">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-brand-dark border-border-subtle text-white placeholder:text-text-muted focus:border-brand-accent/50 focus:ring-brand-accent/20 h-8 text-sm rounded-lg"
          />
        </div>
      </div>

      <UniversalTokenTable
        market={market}
        strict={market === 'spot' ? activeTab === "strict" : false}
        searchQuery={searchQuery}
        mode="full"
      />
    </div>
  );
} 