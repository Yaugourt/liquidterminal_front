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
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <RecentDataTable />
        </div>
        <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
          <TransfersDeployTable />
        </div>
      </div>

      {/* Validators Table */}
      <div className="bg-brand-secondary/60 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
        <ValidatorsTable />
      </div>
    </>
  );
}
