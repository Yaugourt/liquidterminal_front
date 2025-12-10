import { useState } from "react";
import { ActivityTab } from "@/components/types/explorer.types";
import { TransfersTable } from "./tables/TransfersTable";
import { DeploysTable } from "./tables/DeploysTable";

export function TransfersDeployTable() {
  const [activeTab, setActiveTab] = useState<ActivityTab>("transfers");

  const tabs: { key: ActivityTab; label: string }[] = [
    { key: 'transfers', label: 'Transfers' },
    { key: 'deploy', label: 'Deploy' }
  ];

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="flex items-center gap-2 p-4 border-b border-white/5">
        <div className="flex bg-brand-dark rounded-lg p-1 border border-white/5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${activeTab === tab.key
                ? 'bg-brand-accent text-brand-tertiary shadow-sm font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === "transfers" && <TransfersTable />}
        {activeTab === "deploy" && <DeploysTable />}
      </div>
    </div>
  );
} 