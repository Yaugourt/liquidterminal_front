import React from "react";
import { LiquidationsStatsCard, LiquidationsSection, LiquidationsChartSection, LiquidationsProvider } from "@/components/explorer/liquidation";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function LiquidationsPage() {
  return (
    <LiquidationsProvider>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:items-stretch">
        <GlassPanel>
          <LiquidationsStatsCard />
        </GlassPanel>
        <GlassPanel className="md:col-span-2">
          <LiquidationsChartSection />
        </GlassPanel>
      </div>

      <GlassPanel>
        <LiquidationsSection />
      </GlassPanel>
    </LiquidationsProvider>
  );
}
