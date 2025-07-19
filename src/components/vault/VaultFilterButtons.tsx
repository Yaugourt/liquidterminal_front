"use client";

type VaultChartType = "accountValue" | "pnl";

interface VaultFilterButtonsProps {
  selectedChart: VaultChartType;
  onChartChange: (chart: VaultChartType) => void;
}

export const VaultFilterButtons = ({ selectedChart, onChartChange }: VaultFilterButtonsProps) => {
  const tabs: { key: VaultChartType; label: string }[] = [
    { key: 'accountValue', label: 'Account Value' },
    { key: 'pnl', label: 'PnL' }
  ];

  return (
    <div className="flex justify-start items-center">
      <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChartChange(tab.key)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              selectedChart === tab.key
                ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}; 