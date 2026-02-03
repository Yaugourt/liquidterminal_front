import React from "react";
import { LiquidationsStatsCard, LiquidationsSection, LiquidationsChartSection, LiquidationsProvider } from "@/components/explorer/liquidation";
import { Card } from "@/components/ui/card";

export default function LiquidationsPage() {
  return (
    <LiquidationsProvider>
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
