"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UniversalTokenTable } from "./UniversalTokenTable";

interface TokensSectionProps {
  market: 'spot' | 'perp';
}

/** Token directory — carte table V4 : onglets + recherche dans le header, table dessous. */
export function TokensSection({ market }: TokensSectionProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs =
    market === 'spot'
      ? [{ key: 'all', label: 'All' }, { key: 'strict', label: 'Strict' }]
      : [{ key: 'all', label: 'All' }];

  return (
    <Card>
      {/* Card header — onglets (gauche) + recherche (droite) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-3 border-b border-border-subtle">
        <div className="flex bg-surface-2 rounded-md p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                (activeTab || 'all') === tab.key
                  ? 'bg-brand text-brand-text-on'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs sm:w-auto">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
          <Input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 h-8 text-sm"
          />
        </div>
      </div>

      <UniversalTokenTable
        market={market}
        strict={market === 'spot' ? activeTab === "strict" : false}
        searchQuery={searchQuery}
        mode="full"
      />
    </Card>
  );
}
