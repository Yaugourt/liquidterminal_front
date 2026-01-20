"use client";

import { useState } from "react";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TrendingTokensTabs } from "@/components/dashboard/tokens/TrendingTokensTabs";
import { TabSection } from "@/components/dashboard/vaultValidator";
import { TwapSection } from "@/components/dashboard/twap";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";

export default function Home() {
  const [, setActiveTokenTab] = useState<"perp" | "spot" | "auction" | "past-auction">("perp");
  const [, setPastAuctionHeight] = useState<number>(270);

  return (
    <>
      {/* Stats Grid */}
      <StatsGrid />

      {/* Tokens + Chart */}
      <div className="flex flex-col custom:flex-row gap-8 w-full custom:items-stretch">
        <div className="glass-panel w-full custom:w-[35%] flex flex-col">
          <TrendingTokensTabs
            onTabChange={setActiveTokenTab}
            onPastAuctionHeightChange={setPastAuctionHeight}
          />
        </div>
        <div className="glass-panel flex-1 flex flex-col">
          <ChartSection />
        </div>
      </div>

      {/* Vaults/Validators + TWAP */}
      <div className="flex flex-col custom:flex-row custom:gap-8">
        <div className="glass-panel w-full custom:w-[35%] mb-6 custom:mb-0">
          <TabSection />
        </div>
        <div className="glass-panel w-full custom:w-[65%]">
          <TwapSection />
        </div>
      </div>
    </>
  );
}
