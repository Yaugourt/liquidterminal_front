"use client";

import { PortfolioStats } from "../PortfolioStats";
import { PerformanceChart } from "../PerformanceChart";
import { useWalletData } from "@/services/wallets/hooks/useWalletData";

export function StatsSection() {
  const { hasWallets } = useWalletData();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
      <PortfolioStats />
      <PerformanceChart />
      {!hasWallets && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#051728CC] p-4 rounded-lg text-center z-10">
          <p className="text-white">Ajoutez un wallet pour voir vos statistiques</p>
        </div>
      )}
    </div>
  );
}
