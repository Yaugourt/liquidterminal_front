import { memo } from "react";
import { ValidatorSubTab } from "./types";

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
    { key: 'unstaking', label: 'Unstaking Queue' },
    { key: 'stakers', label: 'Stakers' }
  ];

  return (
    <div className="flex justify-start items-center">
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
    </div>
  );
}); 