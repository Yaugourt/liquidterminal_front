type TabType = 'validators' | 'vaults';

interface TabButtonsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabButtons({ activeTab, onTabChange }: TabButtonsProps) {
  const tabs: { key: TabType; label: string }[] = [
    { key: 'validators', label: 'Validators' },
    { key: 'vaults', label: 'Vaults' }
  ];

  return (
    <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.key
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