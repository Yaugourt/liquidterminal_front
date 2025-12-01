import { memo } from "react";
import { TabButtonsProps } from "@/components/types/dashboard.types";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const TabButtonsComponent = ({ activeTab, setActiveTab }: TabButtonsProps) => {
  const tabs: { key: string; label: string }[] = [
    { key: 'vault', label: 'Vaults' },
    { key: 'stacking', label: 'Validators' }
  ];

  const getSeeAllLink = () => {
    switch (activeTab) {
      case 'vault':
        return '/explorer/vaults';
      case 'stacking':
        return '/explorer/validator';  
      default:
        return null;
    }
  };

  const seeAllLink = getSeeAllLink();

  return (
    <div className="flex justify-between items-center p-4 border-b border-white/5">
      <div className="flex items-center gap-2">
        <div className="flex bg-[#0A0D12] rounded-lg p-1 border border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
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
      
      {seeAllLink && (
        <Link
          href={seeAllLink}
          className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-[#83E9FF] transition-colors"
        >
          View All
          <ExternalLink size={10} />
        </Link>
      )}
    </div>
  );
};

export const TabButtons = memo(TabButtonsComponent);
TabButtons.displayName = 'TabButtons';
