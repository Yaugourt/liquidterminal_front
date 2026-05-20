import React from "react";
import { LiquidationsStatsCard, LiquidationsSection, LiquidationsChartSection, LiquidationsProvider } from "@/components/explorer/liquidation";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common";

export default function LiquidationsPage() {
  return (
    <LiquidationsProvider>
      <PageHeader
        title="Liquidations"
        description="Liquidation events on HyperLiquid — aggregate stats, charts, and a real-time feed of forced position closures."
      />

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
