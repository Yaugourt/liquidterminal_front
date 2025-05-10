"use client";

import { Header } from "@/components/Header";
import { StatsGrid } from "@/components/explorer/StatsGrid";
import { BlocksTable } from "@/components/explorer/BlocksTable";
import { RecentTransactionsTable } from "@/components/explorer/RecentTransactionsTable";
import { ValidatorsTable } from "@/components/explorer/ValidatorsTable";
import { HoldersActivityChart } from "@/components/explorer/HoldersActivityChart";

export default function Explorer() {
  return (
    <div className="min-h-screen">
      <Header customTitle="Explorer" />

      <div className="p-4 space-y-6">
        {/* Simplified Stats Section en haut */}
        <StatsGrid />

        {/* Graphique d'activité et tableau des validateurs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ValidatorsTable />
          <HoldersActivityChart />
        </div>

        {/* Tables des blocs et transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BlocksTable />
          <RecentTransactionsTable />
        </div>
      </div>
    </div>
  );
}
