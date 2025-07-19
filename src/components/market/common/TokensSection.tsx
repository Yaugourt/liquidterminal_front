"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { TokenTabs } from "./TokenTabs";
import { TokenTable } from "./TokenTable";

interface TokensSectionProps {
  market: 'spot' | 'perp';
}

export function TokensSection({ market }: TokensSectionProps) {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div>
      <TokenTabs 
        market={market}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <TokenTable 
        market={market}
        strict={market === 'spot' ? activeTab === "strict" : false} 
      />
    </div>
  );
} 