"use client";

import { ExplorerKpiBar } from "@/components/explorer/ExplorerKpiBar";
import { RecentDataTable } from "@/components/explorer/recentBlockTx/RecentDataTable";
import { ExplorerVolumeChart } from "@/components/explorer/ExplorerVolumeChart";
import { EvmSection } from "@/components/explorer/evm/EvmSection";
import { EvmBridgeEventsTable } from "@/components/explorer/evm/EvmBridgeEventsTable";
import { ValidatorsSample } from "@/components/explorer/ValidatorsSample";
import { VaultsSample } from "@/components/explorer/VaultsSample";
import { Card } from "@/components/ui/card";

export default function Explorer() {
  return (
    <>
      <div className="space-y-2">
        <h1 className="font-inter text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Explorer
        </h1>
        <p className="text-sm text-text-secondary max-w-2xl">
          HyperLiquid on-chain explorer — live network stats, recent transactions, token deployments, and validators.
        </p>
      </div>

      <ExplorerKpiBar />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <RecentDataTable />
        </Card>
        <Card>
          <ExplorerVolumeChart />
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
