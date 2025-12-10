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
      color: 'text-emerald-400'
    },
    { 
      id: 'pending', 
      label: 'Pending Review',
      count: counts.pending,
      color: 'text-amber-400'
    },
    { 
      id: 'rejected', 
      label: 'Rejected',
      count: counts.rejected,
      color: 'text-rose-400'
    }
  ];

  return (
    <div className="flex bg-brand-dark rounded-lg p-1 border border-white/5 w-fit">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap",
            activeTab === tab.id
              ? "bg-brand-accent text-brand-tertiary shadow-sm font-bold"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
          )}
        >
          <span>
            {tab.label}
          </span>
          {tab.count > 0 && (
            <span className={cn(
              "px-1.5 py-0.5 text-[10px] rounded-md font-medium",
              activeTab === tab.id
                ? "bg-brand-tertiary/20 text-brand-tertiary"
                : `bg-white/5 ${tab.color}`
            )}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
});
