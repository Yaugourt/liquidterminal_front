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
} 