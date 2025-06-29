import { memo } from "react";
import { TabButtonsProps } from "@/components/types/dashboard.types";

export const TabButtons = memo(({ activeTab, setActiveTab }: TabButtonsProps) => {
  const tabs: { key: string; label: string }[] = [
    { key: 'vault', label: 'Vault' },
    { key: 'stacking', label: 'Staking' },
    { key: 'auction', label: 'Auction' }
  ];

  return (
    <div className="flex justify-start items-center mb-4">
      <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#83E9FF] text-[#051728] shadow-sm'
                : 'text-[#FFFFFF99] hover:text-white hover:bg-[#FFFFFF0A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}); 