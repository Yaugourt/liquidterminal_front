"use client";

import { useState } from "react";
import { VaultChartDisplay } from "./VaultChartDisplay";
import { useVaultDetails } from "@/services/explorer/vault/hooks/useVaultDetails";
import { VaultChartTimeframe } from "@/services/explorer/vault/types";

interface VaultChartSectionProps {
  vaultAddress: string;
  chartHeight?: number;
}

type VaultChartType = "accountValue" | "pnl";

export const VaultChartSection = ({ vaultAddress, chartHeight = 320 }: VaultChartSectionProps) => {
  const [selectedChart, setSelectedChart] = useState<VaultChartType>("accountValue");
  const [selectedTimeframe, setSelectedTimeframe] = useState<VaultChartTimeframe>("day");

  const { chartData, isLoading, error } = useVaultDetails(vaultAddress, selectedTimeframe);

  // Mapping des timeframes de l'API vers les labels
  const availableTimeframes: { value: VaultChartTimeframe; label: string }[] = [
    { value: 'day', label: '1D' },
    { value: 'week', label: '1W' },
    { value: 'month', label: '1M' },
    { value: 'allTime', label: 'All' }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col">
        <VaultChartDisplay
          data={chartData}
          isLoading={isLoading}
          error={error}
          selectedChart={selectedChart}
          onChartChange={setSelectedChart}
          selectedTimeframe={selectedTimeframe}
          onTimeframeChange={setSelectedTimeframe}
          availableTimeframes={availableTimeframes}
          chartHeight={chartHeight}
        />
      </div>
    </div>
  );
}; 