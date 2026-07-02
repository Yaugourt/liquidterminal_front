"use client";

import { useState } from "react";
import { PageHeader } from "@/components/common";
import { PillTabs } from "@/components/ui/pill-tabs";
import { OperatorLens } from "@/components/explorer/validator/lens/OperatorLens";
import { CapitalLens } from "@/components/explorer/validator/lens/CapitalLens";
import { GovernanceLens } from "@/components/explorer/validator/lens/GovernanceLens";

type Lens = "operator" | "capital" | "governance";

const LENS_TABS = [
  { value: "operator", label: "Operator" },
  { value: "capital", label: "Capital" },
  { value: "governance", label: "Governance" },
];

/** Per-lens header description — one product, three reading angles. */
const LENS_DESCRIPTION: Record<Lens, string> = {
  operator: "Health and performance of the active validator set.",
  capital: "Where stake sits and how it's flowing out.",
  governance: "Pending L1 votes awaiting validator ratification.",
};

export default function ValidatorPage() {
  const [lens, setLens] = useState<Lens>("operator");

  return (
    <div className="space-y-6">
      <PageHeader title="Validators" description={LENS_DESCRIPTION[lens]}>
        <PillTabs
          tabs={LENS_TABS}
          activeTab={lens}
          onTabChange={(value) => setLens(value as Lens)}
          variant="text"
        />
      </PageHeader>

      {lens === "operator" && <OperatorLens />}
      {lens === "capital" && <CapitalLens />}
      {lens === "governance" && <GovernanceLens />}
    </div>
  );
}
