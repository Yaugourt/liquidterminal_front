"use client";

import { PageHeader } from "@/components/common";
import { PulseStrip } from "@/components/dashboard/PulseStrip";
import { MoversCard } from "@/components/dashboard/MoversCard";
import { TabSection } from "@/components/dashboard/vaultValidator";
import { TwapSection } from "@/components/dashboard/twap";
import { ChartSection } from "@/components/dashboard/chart/ChartSection";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Ecosystem Overview"
        description="Real-time pulse of the HyperLiquid ecosystem — markets, capital, and live activity at a glance."
      />

      {/* Niveau 1 — Pulse de l'écosystème */}
      <PulseStrip />

      {/* Niveau 2 — Tendances */}
      <Card className="flex flex-col min-h-[420px]">
        <ChartSection />
      </Card>

      {/* Niveau 3 — Ce qui bouge : spot + perp côte à côte */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <MoversCard market="spot" />
        <MoversCard market="perp" />
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
