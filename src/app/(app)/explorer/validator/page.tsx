"use client";

import React, { useState } from "react";
import { ValidatorStatsCard } from "@/components/explorer/validator/ValidatorStatsCard";
import { ValidatorTable } from "@/components/explorer/validator/ValidatorTable";
import { ValidatorChartSection } from "@/components/explorer/validator/chart/ValidatorChartSection";
import { PillTabs } from "@/components/ui/pill-tabs";
import { ValidatorSubTab } from "@/components/explorer/validator/types";

export default function ValidatorPage() {
  const [validatorSubTab, setValidatorSubTab] = useState<ValidatorSubTab>('all');

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel">
          <ValidatorStatsCard />
        </div>
        <div className="glass-panel md:col-span-2">
          <ValidatorChartSection />
        </div>
      </div>

      {/* Tabs above table */}
      <div className="flex justify-start items-center">
        <PillTabs
          tabs={[
            { value: 'all', label: 'All Validators' },
            { value: 'transactions', label: 'Staking Transactions' },
            { value: 'unstaking', label: 'Unstaking Queue' },
            { value: 'stakers', label: 'Stakers' }
          ]}
          activeTab={validatorSubTab}
          onTabChange={(val) => setValidatorSubTab(val as ValidatorSubTab)}
          className="bg-brand-dark border border-white/5"
        />
      </div>

      <div className="glass-panel">
        <ValidatorTable activeTab={validatorSubTab} />
      </div>
    </>
  );
}