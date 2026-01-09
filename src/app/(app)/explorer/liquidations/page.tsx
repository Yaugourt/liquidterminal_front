import React from "react";
import { LiquidationsStatsCard, LiquidationsSection, LiquidationsChartSection } from "@/components/explorer/liquidation";

export default function LiquidationsPage() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:items-stretch">
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <LiquidationsStatsCard />
        </div>
        <div className="md:col-span-3 bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <LiquidationsChartSection />
        </div>
      </div>

      <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <LiquidationsSection />
      </div>
    </>
  );
}
