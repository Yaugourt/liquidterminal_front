type TabType = 'validators' | 'vaults' | 'liquidations';

interface TabButtonsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabButtons({ activeTab, onTabChange }: TabButtonsProps) {
  const tabs: { key: TabType; label: string }[] = [
    { key: 'validators', label: 'Validators' },
    { key: 'vaults', label: 'Vaults' },
    { key: 'liquidations', label: 'Liquidations' }
  ];

  return (
    <div className="flex bg-brand-dark rounded-lg p-1 border border-border-subtle">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.key
              ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
              : 'tab-inactive'
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
} 