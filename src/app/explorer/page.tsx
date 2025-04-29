"use client";

import { UnifiedHeader } from "@/components/UnifiedHeader";
import { StatsGrid } from "@/components/explorer/StatsGrid";
import { BlocksTable } from "@/components/explorer/BlocksTable";
import { RecentTransactionsTable } from "@/components/explorer/RecentTransactionsTable";
import { ValidatorsTable } from "@/components/explorer/ValidatorsTable";
export default function Explorer() {
  return (
    <div className="min-h-screen p-4">
      <UnifiedHeader customTitle="Explorer" />

      <div className="p-4 lg:p-12 space-y-6">
        {/* Stats Section avec table de transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Stats Grid avec background */}
          <div
            className="bg-[#1692ADB2] rounded-lg p-6 flex items-center justify-center lg:min-h-[240px]"
            style={{
              backgroundImage: "url(/images/pattern.svg)",
              backgroundSize: "cover",
            }}
          >
            <div className="w-full max-w-[450px]">
              <StatsGrid />
            </div>
          </div>

          {/* Table de transactions */}
          <div>
            <ValidatorsTable />
          </div>
        </div>

        {/* Tables principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BlocksTable />
          <RecentTransactionsTable />
        </div>
      </div>
    </div>
  );
}
