"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { MarketStatsSectionPerp } from "@/components/market/perp/MarketStatsSectionPerp";
import { PerpTokensSection } from "@/components/market/perp/PerpTokensSection";

export default function MarketPerp() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Market Perp");
  }, [setTitle]);

  return (
    <div className="min-h-screen">
      <div className="p-4">
      <UnifiedHeader customTitle="Market Perpetual" />
        <MarketStatsSectionPerp />
        <PerpTokensSection />
      </div>
    </div>
  );
} 