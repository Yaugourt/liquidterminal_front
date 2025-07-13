import { memo } from "react";
import { TabButtonsProps } from "@/components/types/dashboard.types";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export const TabButtons = memo(({ activeTab, setActiveTab }: TabButtonsProps) => {
  const tabs: { key: string; label: string }[] = [
    { key: 'vault', label: 'Vault' },
    { key: 'stacking', label: 'Validators' },
    { key: 'auction', label: 'Past auctions' }
  ];

  const getSeeAllLink = () => {
    switch (activeTab) {
      case 'vault':
        return '/vault';
      case 'stacking':
        return '/validator';  
      case 'auction':
        return null; // Pas encore disponible
      default:
        return null;
    }
  };

  const seeAllLink = getSeeAllLink();

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center bg-[#FFFFFF0A] rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
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
      
      {seeAllLink && (
        <Link
          href={seeAllLink}
          className="flex items-center gap-1 px-3 py-1 text-sm text-[#f9e370] hover:text-white transition-colors"
        >
          See All
          <ExternalLink size={14} />
        </Link>
      )}
    </div>
  );
}); 