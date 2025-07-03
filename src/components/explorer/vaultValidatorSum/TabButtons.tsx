import { Button } from "@/components/ui/button";

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