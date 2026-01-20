type TabType = 'blocks' | 'transactions';

interface TabSelectorProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabSelector({ activeTab, onTabChange }: TabSelectorProps) {
  const tabs: { key: TabType; label: string }[] = [
    { key: 'blocks', label: 'Blocks' },
    { key: 'transactions', label: 'Transactions' }
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
              : 'tab-inactive'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
} 