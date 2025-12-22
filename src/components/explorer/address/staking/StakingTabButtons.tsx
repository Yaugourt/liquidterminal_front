type StakingSubTab = 'delegations' | 'history' | 'rewards';

interface StakingTabButtonsProps {
  activeSubTab: StakingSubTab;
  onSubTabChange: (subTab: StakingSubTab) => void;
}

export function StakingTabButtons({ activeSubTab, onSubTabChange }: StakingTabButtonsProps) {
  const tabs: { key: StakingSubTab; label: string }[] = [
    { key: 'delegations', label: 'Delegations' },
    { key: 'history', label: 'History' },
    { key: 'rewards', label: 'Rewards' }
  ];

  return (
    <div className="flex items-center bg-[#FFFFFF0A] rounded-md p-0.5 w-fit">
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => onSubTabChange(tab.key)}
          className={`px-3 py-1 rounded-sm text-xs font-medium transition-colors ${
            activeSubTab === tab.key
              ? 'bg-brand-accent text-brand-tertiary shadow-sm'
              : 'text-white hover:text-white hover:bg-[#FFFFFF0A]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
} 