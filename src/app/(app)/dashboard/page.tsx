"use client";

import { PageHeader } from "@/components/common";
import { HeroPulse } from "@/components/dashboard/HeroPulse";
import { TopMovers } from "@/components/dashboard/TopMovers";
import { LiveNow } from "@/components/dashboard/LiveNow";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Ecosystem Overview"
        description="Real-time pulse of the HyperLiquid ecosystem."
      />

      {/* Hero — volume écosystème + KPI calmes */}
      <HeroPulse />

      {/* Tendance — un seul chart, pleine largeur */}
      <Card className="flex flex-col min-h-[400px]">
        <ChartSection />
      </Card>

      {/* Highlights curés — listes légères, pas de tableaux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopMovers />
        <LiveNow />
      </div>
    </div>
  );
}
