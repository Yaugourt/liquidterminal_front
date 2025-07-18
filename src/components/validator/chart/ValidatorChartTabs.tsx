import { memo } from "react";

export type ChartTabType = 'distribution' | 'unstaking';

interface ValidatorChartTabsProps {
  activeTab: ChartTabType;
  onTabChange: (tab: ChartTabType) => void;
}

/**
 * Composant pour les tabs des charts validator
 */
export const ValidatorChartTabs = memo(function ValidatorChartTabs({ 
  activeTab, 
  onTabChange 
}: ValidatorChartTabsProps) {
  const tabs = [
    { key: 'distribution' as const, label: 'Distribution' },
    { key: 'unstaking' as const, label: 'Unstaking' }
  ];

  return (
    <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.key
              ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
              : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}); 