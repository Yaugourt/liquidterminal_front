"use client";

import {
  StatsGrid,
  RecentDataTable,
  ValidatorsTable,
  TransfersDeployTable
} from "@/components/explorer";

export default function Explorer() {
  return (
    <>
      {/* Stats Grid */}
      <StatsGrid />

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-panel">
          <RecentDataTable />
        </div>
        <div className="glass-panel">
          <TransfersDeployTable />
        </div>
      </div>

      {/* Validators Table */}
      <div className="glass-panel">
        <ValidatorsTable />
      </div>
    </>
  );
}
