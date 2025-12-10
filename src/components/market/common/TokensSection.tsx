"use client";

import { useState } from "react";

import { TokenTabs } from "./TokenTabs";
import { UniversalTokenTable } from "./UniversalTokenTable";

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

      <UniversalTokenTable
        market={market}
        strict={market === 'spot' ? activeTab === "strict" : false}
        searchQuery={searchQuery}
        mode="full"
      />
    </div>
  );
} 