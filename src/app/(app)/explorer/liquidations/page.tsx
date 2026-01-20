import React from "react";
import { LiquidationsStatsCard, LiquidationsSection, LiquidationsChartSection, LiquidationsProvider } from "@/components/explorer/liquidation";

export default function LiquidationsPage() {
  return (
    <LiquidationsProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-stretch">
        <div className="glass-panel">
          <LiquidationsStatsCard />
        </div>
        <div className="glass-panel md:col-span-2">
          <LiquidationsChartSection />
        </div>
      </div>

      <div className="glass-panel">
        <LiquidationsSection />
      </div>
    </LiquidationsProvider>
  );
}
