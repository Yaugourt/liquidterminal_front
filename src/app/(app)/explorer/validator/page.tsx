"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ValidatorStatsCard } from "@/components/explorer/validator/ValidatorStatsCard";
import { ValidatorTable } from "@/components/explorer/validator/ValidatorTable";
import { ValidatorChartSection } from "@/components/explorer/validator/chart/ValidatorChartSection";
import { PillTabs } from "@/components/ui/pill-tabs";
import { ValidatorSubTab } from "@/components/explorer/validator/types";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common";

const TABLE_TABS = [
  { value: "all", label: "All Validators" },
  { value: "transactions", label: "Staking Transactions" },
  { value: "unstaking", label: "Unstaking Queue" },
  { value: "stakers", label: "Stakers" },
] as const;

export default function ValidatorPage() {
  const [validatorSubTab, setValidatorSubTab] = useState<ValidatorSubTab>("all");

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title="Validators"
        description="HyperLiquid validators — staking stats, delegation distribution, staking transactions, and the unstaking queue."
      />

      {/* Stats strip — 4 KPI cards full width */}
      <ValidatorStatsCard />

      {/* Chart card */}
      <Card>
        <ValidatorChartSection />
      </Card>

      {/* Table card — tabs live inside the card header */}
      <div className="bg-surface border border-border-subtle rounded-lg overflow-hidden">
        {/* Card header: tabs */}
        <div className="flex items-center px-3.5 py-3 border-b border-border-subtle">
          <PillTabs
            tabs={TABLE_TABS as unknown as { value: string; label: string }[]}
            activeTab={validatorSubTab}
            onTabChange={(val) => setValidatorSubTab(val as ValidatorSubTab)}
          />
        </div>

        <ValidatorTable activeTab={validatorSubTab} />
      </div>
    </motion.div>
  );
}
