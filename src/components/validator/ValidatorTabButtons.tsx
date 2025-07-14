import { memo } from "react";

type ValidatorSubTab = 'all' | 'transactions' | 'unstaking';

interface ValidatorTabButtonsProps {
  activeTab: ValidatorSubTab;
  onTabChange: (tab: ValidatorSubTab) => void;
}

export const ValidatorTabButtons = memo(function ValidatorTabButtons({ 
  activeTab, 
  onTabChange 
}: ValidatorTabButtonsProps) {
  const tabs: { key: ValidatorSubTab; label: string }[] = [
    { key: 'all', label: 'All Validators' },
    { key: 'transactions', label: 'Staking Transactions' },
    { key: 'unstaking', label: 'Unstaking Queue' }
  ];

  return (
    <div className="flex justify-start items-center">
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
    </div>
  );
}); 