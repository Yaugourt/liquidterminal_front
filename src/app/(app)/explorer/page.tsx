"use client";

import {
  StatsGrid,
  RecentDataTable,
  ValidatorsTable,
  TransfersDeployTable
} from "@/components/explorer";
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

      {/* Stats Grid */}
      <StatsGrid />

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <RecentDataTable />
        </Card>
        <Card>
          <TransfersDeployTable />
        </Card>
      </div>

      {/* Validators Table */}
      <Card>
        <ValidatorsTable />
      </Card>
    </>
  );
}
