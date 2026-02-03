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
