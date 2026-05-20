"use client";

import { ExplorerKpiBar } from "@/components/explorer/ExplorerKpiBar";
import { RecentDataTable } from "@/components/explorer/recentBlockTx/RecentDataTable";
import { TransfersDeployTable } from "@/components/explorer/TransfersDeployTable";
import { EvmSection } from "@/components/explorer/evm/EvmSection";
import { EvmBridgeEventsTable } from "@/components/explorer/evm/EvmBridgeEventsTable";
import { ValidatorsSample } from "@/components/explorer/ValidatorsSample";
import { VaultsSample } from "@/components/explorer/VaultsSample";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/common";

export default function Explorer() {
  return (
    <>
      <PageHeader
        title="Explorer"
        description="HyperLiquid on-chain explorer — live network stats, recent transactions, token deployments, and validators."
      />

      <ExplorerKpiBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <RecentDataTable />
        </Card>
        <Card>
          <TransfersDeployTable />
        </Card>
      </div>

      <EvmSection />

      <Card>
        <EvmBridgeEventsTable />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <ValidatorsSample />
        </Card>
        <Card>
          <VaultsSample />
        </Card>
      </div>
    </>
  );
}
