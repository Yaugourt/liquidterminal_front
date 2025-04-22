"use client";

import { PortfolioStats } from "../PortfolioStats";
import { PerformanceChart } from "../PerformanceChart";

export function StatsSection() {

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
      <PortfolioStats />
      <PerformanceChart />
    
    </div>
  );
}
