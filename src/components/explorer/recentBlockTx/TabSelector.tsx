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
    <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
            activeTab === tab.key
              ? 'bg-[#83E9FF] text-[#051728] shadow-sm font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
} 