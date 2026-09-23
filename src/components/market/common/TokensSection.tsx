"use client";

import { useState } from "react";
import { TableSearch } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { UniversalTokenTable } from "./UniversalTokenTable";

interface TokensSectionProps {
  market: 'spot' | 'perp';
}

const SPOT_TABS = [
  { value: 'all', label: 'All' },
  { value: 'strict', label: 'Strict' },
];

/** Token directory — sub-tabs (spot only) + search in the table toolbar. */
export function TokensSection({ market }: TokensSectionProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const toolbar = (
    <>
      {market === 'spot' && (
        <PillTabs variant="text" tabs={SPOT_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      <TableSearch value={searchQuery} onChange={setSearchQuery} placeholder="Search tokens…" className="ml-auto" />
    </>
  );

  return (
    <UniversalTokenTable
      market={market}
      strict={market === 'spot' ? activeTab === "strict" : false}
      searchQuery={searchQuery}
      mode="full"
      toolbar={toolbar}
    />
  );
}
