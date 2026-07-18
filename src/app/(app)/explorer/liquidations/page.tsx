import React from "react";
import { LiquidationsStatsCard, LiquidationsSection, LiquidationsChartSection, LiquidationsProvider } from "@/components/explorer/liquidation";
import { Card } from "@/components/ui/card";
import { PageHeader, PageFaq } from "@/components/common";
import { LIQUIDATIONS_FAQ } from "@/lib/page-faqs";

export default function LiquidationsPage() {
  return (
    <LiquidationsProvider>
      <PageHeader
        title="Liquidations"
        titleQualifier="on Hyperliquid"
        description="Liquidation events on Hyperliquid — aggregate stats, charts, and a real-time feed of forced position closures."
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
      <PageFaq items={LIQUIDATIONS_FAQ} />
    </LiquidationsProvider>
  );
}
