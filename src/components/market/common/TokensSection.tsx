"use client";

import { useState } from "react";

import { TokenTabs } from "./TokenTabs";
import { TokenTable } from "./TokenTable";

interface TokensSectionProps {
  market: 'spot' | 'perp';
}

export function TokensSection({ market }: TokensSectionProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div>
      <TokenTabs 
        market={market}
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <TokenTable 
        market={market}
        strict={market === 'spot' ? activeTab === "strict" : false}
        searchQuery={searchQuery}
      />
    </div>
  );
} 