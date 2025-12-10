import { memo } from "react";
import { ValidatorSubTab } from "./types";
import { PillTabs } from "@/components/ui/pill-tabs";

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
      <PillTabs
        tabs={tabs.map(t => ({ value: t.key, label: t.label }))}
        activeTab={activeTab}
        onTabChange={(val) => onTabChange(val as ValidatorSubTab)}
        className="bg-[#0A0D12] border border-white/5"
      />
    </div>
  );
}); 