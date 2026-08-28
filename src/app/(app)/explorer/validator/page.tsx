"use client";

import { useState } from "react";
import { PageHeader, PageFaq, DataStatus } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { OperatorLens } from "@/components/explorer/validator/lens/OperatorLens";
import { CapitalLens } from "@/components/explorer/validator/lens/CapitalLens";
import { useValidators } from "@/services/explorer/validator/hooks";
import { VALIDATORS_FAQ } from "@/lib/page-faqs";

type Lens = "operator" | "capital";

const LENS_TABS = [
  { value: "operator", label: "Operator" },
  { value: "capital", label: "Capital" },
];

/** Per-lens header description — one product, two reading angles. */
const LENS_DESCRIPTION: Record<Lens, string> = {
  operator: "Health and performance of the active validator set.",
  capital: "Where stake sits and how it's flowing out.",
};

export default function ValidatorPage() {
  const [lens, setLens] = useState<Lens>("operator");
  // Page-level freshness cue for the validator set (shared across lenses).
  const { dataUpdatedAt, isRefreshing, refetch } = useValidators();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Validators"
        titleQualifier="· Hyperliquid staking"
        description={LENS_DESCRIPTION[lens]}
        actions={
          <DataStatus
            variant="polled"
            updatedAt={dataUpdatedAt}
            isRefreshing={isRefreshing}
            onRefresh={refetch}
          />
        }
      >
        <PillTabs
          tabs={LENS_TABS}
          activeTab={lens}
          onTabChange={(value) => setLens(value as Lens)}
          variant="text"
        />
      </PageHeader>

      {lens === "operator" && <OperatorLens />}
      {lens === "capital" && <CapitalLens />}
      <PageFaq items={VALIDATORS_FAQ} />
    </div>
  );
}
