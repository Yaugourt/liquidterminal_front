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
    <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === tab.key
              ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
              : 'text-text-secondary hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}); 