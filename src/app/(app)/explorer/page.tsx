"use client";

import {
  StatsGrid,
  RecentDataTable,
  ValidatorsTable,
  TransfersDeployTable
} from "@/components/explorer";
import { GlassPanel } from "@/components/ui/glass-panel";

export default function Explorer() {
  return (
    <>
      {/* Stats Grid */}
      <StatsGrid />

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassPanel>
          <RecentDataTable />
        </GlassPanel>
        <GlassPanel>
          <TransfersDeployTable />
        </GlassPanel>
      </div>

      {/* Validators Table */}
      <GlassPanel>
        <ValidatorsTable />
      </GlassPanel>
    </>
  );
}
