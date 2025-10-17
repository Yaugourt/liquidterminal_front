import { memo } from "react";
import { cn } from "@/lib/utils";

interface StatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts?: {
    all: number;
    approved: number;
    pending: number;
    rejected: number;
  };
}

export const StatusTabs = memo(function StatusTabs({ 
  activeTab, 
  onTabChange,
  counts = { all: 0, approved: 0, pending: 0, rejected: 0 }
}: StatusTabsProps) {
  const tabs = [
    { 
      id: 'all', 
      label: 'All Projects',
      count: counts.all,
      color: 'text-white'
    },
    { 
      id: 'approved', 
      label: 'Approved',
      count: counts.approved,
      color: 'text-green-400'
    },
    { 
      id: 'pending', 
      label: 'Pending Review',
      count: counts.pending,
      color: 'text-yellow-400'
    },
    { 
      id: 'rejected', 
      label: 'Rejected',
      count: counts.rejected,
      color: 'text-red-400'
    }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-2 rounded-lg transition-all flex items-center gap-2",
            "border border-[#1E3851] hover:border-[#83E9FF40]",
            activeTab === tab.id
              ? "bg-[#112941] border-[#83E9FF] text-[#83E9FF]"
              : "bg-[#0A1F32]/50 text-gray-400 hover:text-white"
          )}
        >
          <span className={activeTab === tab.id ? '' : tab.color}>
            {tab.label}
          </span>
          {tab.count > 0 && (
            <span className={cn(
              "px-2 py-0.5 text-xs rounded-full",
              activeTab === tab.id
                ? "bg-[#83E9FF]/20 text-[#83E9FF]"
                : "bg-[#1E3851] text-gray-400"
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
});
