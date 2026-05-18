"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common";
import { PulseStrip } from "@/components/dashboard/PulseStrip";
import { TrendingTokensTabs } from "@/components/dashboard/tokens/TrendingTokensTabs";
import { TabSection } from "@/components/dashboard/vaultValidator";
import { TwapSection } from "@/components/dashboard/twap";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";
import { Card } from "@/components/ui/card";

export default function Home() {
  const [, setActiveTokenTab] = useState<"perp" | "spot" | "auction" | "past-auction">("perp");
  const [, setPastAuctionHeight] = useState<number>(270);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ecosystem Overview"
        description="Real-time pulse of the HyperLiquid ecosystem — markets, capital, and live activity at a glance."
      />

      {/* Niveau 1 — Pulse de l'écosystème */}
      <PulseStrip />

      {/* Tokens + Chart */}
      <div className="flex flex-col custom:flex-row gap-4 w-full custom:items-stretch">
        <Card className="w-full custom:w-[35%] flex flex-col">
          <TrendingTokensTabs
            onTabChange={setActiveTokenTab}
            onPastAuctionHeightChange={setPastAuctionHeight}
          />
        </Card>
        <Card className="flex-1 flex flex-col">
          <ChartSection />
        </Card>
      </div>

      {/* Vaults/Validators + TWAP */}
      <div className="flex flex-col custom:flex-row custom:gap-4">
        <Card className="w-full custom:w-[35%] mb-4 custom:mb-0">
          <TabSection />
        </Card>
        <Card className="w-full custom:w-[65%]">
          <TwapSection />
        </Card>
      </div>
    </div>
  );
}
