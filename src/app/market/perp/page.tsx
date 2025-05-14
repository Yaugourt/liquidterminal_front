"use client";

import { useEffect } from "react";
import { usePageTitle } from "@/store/use-page-title";
import {  Header } from "@/components/Header";
import { MarketStatsSectionPerp } from "@/components/market/perp/MarketStatsSectionPerp";
import { PerpTokensSection } from "@/components/market/perp/PerpTokensSection";

export default function MarketPerp() {
  const { setTitle } = usePageTitle();


  return (
    <div className="min-h-screen">
      <div className="p-4">
        < Header customTitle="Market Perpetual" showFees={true} />
        <MarketStatsSectionPerp />
        <PerpTokensSection />
      </div>
    </div>
  );
} 