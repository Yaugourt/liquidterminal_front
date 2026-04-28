import React from "react";
import { LiquidationsStatsCard, LiquidationsSection, LiquidationsChartSection, LiquidationsProvider } from "@/components/explorer/liquidation";
import { Card } from "@/components/ui/card";

export default function LiquidationsPage() {
  return (
    <LiquidationsProvider>
      <div className="space-y-2">
        <h1 className="font-inter text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Liquidations
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          Liquidation events on HyperLiquid — aggregate stats, charts, and a real-time feed of forced position closures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-stretch">
        <Card>
          <LiquidationsStatsCard />
        </Card>
        <Card className="md:col-span-2">
          <LiquidationsChartSection />
        </Card>
      </div>

      <Card>
        <LiquidationsSection />
      </Card>
    </LiquidationsProvider>
  );
}
