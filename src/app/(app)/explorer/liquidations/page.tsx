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

      {/* Stats beside the chart from xl only: a third of 1024 cut the share
          button and hid half the stats. */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:items-stretch">
        <Card>
          <LiquidationsStatsCard />
        </Card>
        <Card className="xl:col-span-2">
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
